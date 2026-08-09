import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { hashDocument } from '../utils/hash';
import { pdfService } from './pdf.service';
import { qrCodeService } from './qrcode.service';
import { blockchainService } from './blockchain.service';
import { cleanverseTrustService } from './cleanverseTrust.service';

interface SaleItemInput {
  productId: string;
  quantity: number;
}

interface CreateSaleInput {
  customerId?: string;
  /** Provided instead of customerId when the customer doesn't exist yet —
   *  a new Customer record is created in the same transaction as the sale. */
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'CREDIT';
  amountPaid: number;
  items: SaleItemInput[];
}

interface ListParams {
  page: number;
  limit: number;
  customerId?: string;
  paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID';
}

function generateDocNumber(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${stamp}-${rand}`;
}

export const saleService = {
  async create(userId: string, input: CreateSaleInput) {
    if (!input.items || input.items.length === 0) {
      throw ApiError.badRequest('A sale must have at least one item');
    }

    return prisma.$transaction(async (tx) => {
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, userId },
      });

      if (products.length !== productIds.length) {
        throw ApiError.badRequest('One or more products were not found');
      }

      let totalAmount = 0;
      let profit = 0;
      const itemsData: {
        productId: string;
        quantity: number;
        unitPrice: number;
        unitCost: number;
        subtotal: number;
      }[] = [];

      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (item.quantity <= 0) {
          throw ApiError.badRequest(`Quantity for ${product.name} must be greater than zero`);
        }
        if (product.stockQuantity < item.quantity) {
          throw ApiError.conflict(
            `Not enough stock for ${product.name}. Available: ${product.stockQuantity}, requested: ${item.quantity}`
          );
        }

        const unitPrice = Number(product.sellingPrice);
        const unitCost = Number(product.costPrice);
        const subtotal = unitPrice * item.quantity;

        totalAmount += subtotal;
        profit += (unitPrice - unitCost) * item.quantity;

        itemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          unitCost,
          subtotal,
        });
      }

      const amountPaid = Math.min(Math.max(input.amountPaid, 0), totalAmount);
      const paymentStatus = amountPaid >= totalAmount ? 'PAID' : amountPaid > 0 ? 'PARTIAL' : 'UNPAID';

      // Resolve the customer for this sale: an existing customer (verified to
      // belong to this user), a brand-new one created inline right here so
      // the owner never has to leave the sale screen to add one first, or no
      // customer at all (walk-in sale).
      let resolvedCustomerId: string | null = null;

      if (input.customerId) {
        const existingCustomer = await tx.customer.findFirst({
          where: { id: input.customerId, userId },
        });
        if (!existingCustomer) {
          throw ApiError.badRequest('Selected customer was not found');
        }
        resolvedCustomerId = existingCustomer.id;
      } else if (input.customerName && input.customerName.trim()) {
        const newCustomer = await tx.customer.create({
          data: {
            userId,
            name: input.customerName.trim(),
            phone: input.customerPhone?.trim() || null,
            address: input.customerAddress?.trim() || null,
          },
        });
        resolvedCustomerId = newCustomer.id;
      }

      const sale = await tx.sale.create({
        data: {
          userId,
          customerId: resolvedCustomerId,
          totalAmount,
          amountPaid,
          profit,
          paymentStatus,
          paymentMethod: input.paymentMethod,
          items: { create: itemsData },
        },
        include: {
          items: { include: { product: { select: { name: true } } } },
          customer: { select: { id: true, name: true } },
        },
      });

      // Decrement stock for each product sold. Guarded by stockQuantity >=
      // quantity in the WHERE clause (not a separate read-then-write) so two
      // concurrent sales for the same product can't both pass validation and
      // oversell — Postgres locks the row for the duration of this UPDATE,
      // and the second transaction re-checks against the post-commit stock.
      for (const item of itemsData) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          const product = products.find((p) => p.id === item.productId)!;
          throw ApiError.conflict(`Not enough stock for ${product.name} — it just changed. Please try again.`);
        }
      }

      // Track unpaid balance against the customer
      const outstanding = totalAmount - amountPaid;
      if (resolvedCustomerId && outstanding > 0) {
        await tx.customer.update({
          where: { id: resolvedCustomerId },
          data: { outstandingDebt: { increment: outstanding } },
        });
      }

      return sale;
    });
  },

  async list(userId: string, { page, limit, customerId, paymentStatus }: ListParams) {
    const where = {
      userId,
      ...(customerId ? { customerId } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, name: true } },
          items: { include: { product: { select: { name: true } } } },
          invoice: { select: { id: true, invoiceNumber: true } },
          receipt: { select: { id: true, receiptNumber: true } },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return { sales, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  },

  async getById(userId: string, id: string) {
    const sale = await prisma.sale.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        items: { include: { product: { select: { name: true, imageUrl: true } } } },
        invoice: true,
        receipt: true,
      },
    });
    if (!sale) throw ApiError.notFound('Sale not found');

    const [invoiceTrust, receiptTrust] = await Promise.all([
      sale.invoice ? cleanverseTrustService.getTrustState(sale.invoice.documentHash) : null,
      sale.receipt ? cleanverseTrustService.getTrustState(sale.receipt.documentHash) : null,
    ]);

    return {
      ...sale,
      invoice: sale.invoice ? { ...sale.invoice, cleanverseTrust: invoiceTrust } : null,
      receipt: sale.receipt ? { ...sale.receipt, cleanverseTrust: receiptTrust } : null,
    };
  },

  async recordPayment(userId: string, id: string, amount: number) {
    if (amount <= 0) throw ApiError.badRequest('Payment amount must be greater than zero');

    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({ where: { id, userId } });
      if (!sale) throw ApiError.notFound('Sale not found');

      const total = Number(sale.totalAmount);
      const currentPaid = Number(sale.amountPaid);
      const newPaid = Math.min(currentPaid + amount, total);
      const appliedAmount = newPaid - currentPaid;
      const newStatus = newPaid >= total ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';

      // Guarded on the amountPaid we just read (optimistic concurrency) so
      // two concurrent payments on the same sale can't silently overwrite
      // one another — whichever commits second finds amountPaid has moved
      // and fails loudly instead of losing the first payment.
      const updateResult = await tx.sale.updateMany({
        where: { id, userId, amountPaid: sale.amountPaid },
        data: { amountPaid: newPaid, paymentStatus: newStatus },
      });
      if (updateResult.count === 0) {
        throw ApiError.conflict('This sale was just updated elsewhere. Please refresh and try again.');
      }
      const updatedSale = await tx.sale.findFirstOrThrow({ where: { id, userId } });

      if (sale.customerId && appliedAmount > 0) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: { outstandingDebt: { decrement: appliedAmount } },
        });
      }

      return updatedSale;
    });
  },

  async generateInvoice(userId: string, saleId: string) {
    const sale = await this.getSaleForDocument(userId, saleId);

    if (sale.invoice) {
      return sale.invoice;
    }

    const invoiceNumber = generateDocNumber('INV');
    const documentData = {
      documentNumber: invoiceNumber,
      documentType: 'INVOICE' as const,
      saleId: sale.id,
      totalAmount: Number(sale.totalAmount),
      amountPaid: Number(sale.amountPaid),
      items: sale.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
      createdAt: sale.createdAt.toISOString(),
    };
    const documentHash = hashDocument(documentData);

    const { url: pdfUrl } = await pdfService.generate({
      documentNumber: invoiceNumber,
      documentType: 'INVOICE',
      businessName: sale.user.businessName,
      customerName: sale.customer?.name || 'Walk-in customer',
      items: sale.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      totalAmount: Number(sale.totalAmount),
      amountPaid: Number(sale.amountPaid),
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      currency: sale.user.currency,
      createdAt: sale.createdAt,
      documentHash,
    });

    const anchorResult = await blockchainService.anchorHash(documentHash);
    const chainStatus = anchorResult ? 'CONFIRMED' : blockchainService.isConfigured() ? 'FAILED' : 'PENDING';

    return prisma.invoice.create({
      data: {
        userId,
        saleId: sale.id,
        invoiceNumber,
        pdfUrl,
        documentHash,
        txHash: anchorResult?.txHash || null,
        chainStatus,
      },
    });
  },

  async generateReceipt(userId: string, saleId: string) {
    const sale = await this.getSaleForDocument(userId, saleId);

    if (sale.receipt) {
      return sale.receipt;
    }

    const receiptNumber = generateDocNumber('RCT');
    const documentData = {
      documentNumber: receiptNumber,
      documentType: 'RECEIPT' as const,
      saleId: sale.id,
      totalAmount: Number(sale.totalAmount),
      amountPaid: Number(sale.amountPaid),
      items: sale.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
      createdAt: sale.createdAt.toISOString(),
    };
    const documentHash = hashDocument(documentData);

    const { url: pdfUrl } = await pdfService.generate({
      documentNumber: receiptNumber,
      documentType: 'RECEIPT',
      businessName: sale.user.businessName,
      customerName: sale.customer?.name || 'Walk-in customer',
      items: sale.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
      totalAmount: Number(sale.totalAmount),
      amountPaid: Number(sale.amountPaid),
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      currency: sale.user.currency,
      createdAt: sale.createdAt,
      documentHash,
    });

    const qrCodeUrl = await qrCodeService.generateVerificationQr(receiptNumber, documentHash);

    const anchorResult = await blockchainService.anchorHash(documentHash);
    const chainStatus = anchorResult ? 'CONFIRMED' : blockchainService.isConfigured() ? 'FAILED' : 'PENDING';

    return prisma.receipt.create({
      data: {
        userId,
        saleId: sale.id,
        receiptNumber,
        pdfUrl,
        qrCodeUrl,
        documentHash,
        txHash: anchorResult?.txHash || null,
        chainStatus,
      },
    });
  },

  async getSaleForDocument(userId: string, saleId: string) {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, userId },
      include: {
        user: { select: { businessName: true, currency: true } },
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
        invoice: true,
        receipt: true,
      },
    });
    if (!sale) throw ApiError.notFound('Sale not found');
    return sale;
  },
};
