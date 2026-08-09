import { AgentActionStatus, AgentActionType, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { customerService } from './customer.service';
import { saleService } from './sale.service';
import { productService } from './product.service';

interface QueueInput {
  type: AgentActionType;
  summary: string;
  reasoning?: string;
  payload: Record<string, unknown>;
  agentName?: string;
}

export const agentActionService = {
  async queue(userId: string, input: QueueInput) {
    return prisma.agentAction.create({
      data: {
        userId,
        agentName: input.agentName || 'COO',
        type: input.type,
        summary: input.summary,
        reasoning: input.reasoning || null,
        payload: input.payload as Prisma.InputJsonValue,
      },
    });
  },

  async list(userId: string, status?: AgentActionStatus) {
    return prisma.agentAction.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(userId: string, id: string) {
    const action = await prisma.agentAction.findFirst({ where: { id, userId } });
    if (!action) throw ApiError.notFound('Action not found');
    return action;
  },

  async reject(userId: string, id: string) {
    const action = await this.getById(userId, id);
    if (action.status !== 'PENDING') {
      throw ApiError.conflict('This action has already been decided');
    }
    return prisma.agentAction.update({
      where: { id },
      data: { status: 'REJECTED', decidedAt: new Date() },
    });
  },

  /** Approving an action actually performs the real underlying operation,
   *  using the payload captured when the AI proposed it — nothing executes
   *  until this runs. */
  async approve(userId: string, id: string) {
    const action = await this.getById(userId, id);
    if (action.status !== 'PENDING') {
      throw ApiError.conflict('This action has already been decided');
    }

    const payload = action.payload as Record<string, any>;

    try {
      let result: Record<string, unknown>;

      switch (action.type) {
        case 'CREATE_CUSTOMER': {
          const customer = await customerService.create(userId, {
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
          });
          result = { customerId: customer.id, customerName: customer.name };
          break;
        }
        case 'RECORD_SALE': {
          const sale = await saleService.create(userId, {
            customerId: payload.customerId,
            paymentMethod: payload.paymentMethod,
            amountPaid: payload.amountPaid,
            items: payload.items,
          });
          const [invoice, receipt] = await Promise.all([
            saleService.generateInvoice(userId, sale.id),
            saleService.generateReceipt(userId, sale.id),
          ]);
          result = {
            saleId: sale.id,
            totalAmount: Number(sale.totalAmount),
            invoiceNumber: invoice.invoiceNumber,
            receiptNumber: receipt.receiptNumber,
          };
          break;
        }
        case 'RESTOCK_PRODUCT': {
          const updated = await productService.adjustStock(userId, payload.productId, Number(payload.quantity));
          result = { productId: updated.id, productName: updated.name, newStockQuantity: updated.stockQuantity };
          break;
        }
        default:
          throw ApiError.badRequest(`Unknown action type: ${action.type}`);
      }

      return await prisma.agentAction.update({
        where: { id },
        data: {
          status: 'EXECUTED',
          decidedAt: new Date(),
          executedAt: new Date(),
          result: result as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Execution failed unexpectedly';
      await prisma.agentAction.update({
        where: { id },
        data: { status: 'FAILED', decidedAt: new Date(), errorMessage: message },
      });
      throw error instanceof ApiError ? error : ApiError.internal(message);
    }
  },

  /** The Inventory Agent's proactive detection pass — not a scheduled job
   *  (out of scope for this build), run inline whenever Mission Control
   *  loads. Products projected to run out within 5 days get a PENDING
   *  restock proposal queued automatically, with reasoning built from real
   *  14-day sales velocity — never queues a duplicate for a product that
   *  already has one pending. */
  async checkInventoryRisks(userId: string) {
    const insights = await productService.getInventoryInsights(userId);
    // Either signal qualifies: a velocity-projected stockout within 5 days,
    // or already at/below the low-stock threshold right now (covers a
    // product with too little sales history to project a velocity at all).
    const urgent = insights.restockRecommendations.filter(
      (p) => (p.daysUntilStockout !== null && p.daysUntilStockout <= 5) || p.stockQuantity <= p.lowStockThreshold
    );
    if (urgent.length === 0) return;

    const pendingRestocks = await prisma.agentAction.findMany({
      where: { userId, type: 'RESTOCK_PRODUCT', status: 'PENDING' },
      select: { payload: true },
    });
    const alreadyProposed = new Set(
      pendingRestocks
        .map((a) => (a.payload as { productId?: string } | null)?.productId)
        .filter((id): id is string => !!id)
    );

    for (const p of urgent) {
      if (alreadyProposed.has(p.id)) continue;

      const restockQty =
        p.unitsSold30d > 0 ? Math.max(10, Math.round((p.unitsSold30d / 30) * 30)) : Math.max(10, p.lowStockThreshold * 2);

      // Lead with whichever condition actually triggered this proposal —
      // a threshold breach reads as "why is a 20-day runway urgent?" if the
      // velocity framing is stated first when that's not the real reason.
      const belowThreshold = p.stockQuantity <= p.lowStockThreshold;
      let reasoning: string;
      if (belowThreshold && p.daysUntilStockout !== null) {
        const velocityNote = p.velocityChangePct > 0 ? `, and sales velocity increased ${p.velocityChangePct}% over the last 14 days` : '';
        reasoning = `Stock (${p.stockQuantity}) is at or below the restock threshold (${p.lowStockThreshold})${velocityNote} — projected to run out in ${p.daysUntilStockout} day${p.daysUntilStockout === 1 ? '' : 's'} at the current pace.`;
      } else if (belowThreshold) {
        reasoning = `Stock (${p.stockQuantity}) is at or below the restock threshold (${p.lowStockThreshold}), with too little sales history yet to project a run-out date.`;
      } else if (p.velocityChangePct > 0) {
        reasoning = `Sales velocity increased ${p.velocityChangePct}% over the last 14 days and current stock is projected to run out in ${p.daysUntilStockout} day${p.daysUntilStockout === 1 ? '' : 's'}.`;
      } else {
        reasoning = `Current stock is projected to run out in ${p.daysUntilStockout} day${p.daysUntilStockout === 1 ? '' : 's'} based on recent sales.`;
      }

      await this.queue(userId, {
        type: 'RESTOCK_PRODUCT',
        agentName: 'Inventory Agent',
        summary: `Restock ${restockQty} units of ${p.name}`,
        reasoning,
        payload: { productId: p.id, quantity: restockQty },
      });
    }
  },
};
