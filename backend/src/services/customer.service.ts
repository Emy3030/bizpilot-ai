import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

interface CustomerForInsights {
  outstandingDebt: Decimal;
  sales: { totalAmount: Decimal; createdAt: Date }[];
}

// Simple, explainable heuristics — not a model. Every number here is
// derived from data already visible elsewhere on the customer's profile,
// so nothing here can surprise the owner with an unverifiable claim.
function buildCustomerInsights(customer: CustomerForInsights) {
  const lifetimeValue = customer.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  const totalOrders = customer.sales.length;
  const lastPurchaseAt = customer.sales[0]?.createdAt ?? null;
  const daysSinceLastPurchase = lastPurchaseAt
    ? Math.floor((Date.now() - lastPurchaseAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const debt = Number(customer.outstandingDebt);

  let riskScore = 0;
  if (debt > 0) riskScore += Math.min(40, Math.round(debt / 1000) * 2);
  if (daysSinceLastPurchase !== null && daysSinceLastPurchase > 60) riskScore += 30;
  if (daysSinceLastPurchase !== null && daysSinceLastPurchase > 120) riskScore += 20;
  if (totalOrders === 0) riskScore += 10;
  riskScore = Math.max(0, Math.min(100, riskScore));

  const riskLevel: 'Low' | 'Medium' | 'High' = riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low';

  const recommendations: string[] = [];
  if (debt > 0) {
    recommendations.push(`Outstanding balance of ${debt.toFixed(2)} — worth following up before extending more credit.`);
  }
  if (daysSinceLastPurchase !== null && daysSinceLastPurchase > 60) {
    recommendations.push(`No purchase in ${daysSinceLastPurchase} days — a check-in or offer could re-engage them.`);
  }
  if (totalOrders >= 5 && debt === 0) {
    recommendations.push('A loyal, paid-up customer — a good candidate for a loyalty offer or referral ask.');
  }
  if (recommendations.length === 0) {
    recommendations.push('No issues detected — this customer looks healthy.');
  }

  return { lifetimeValue, totalOrders, daysSinceLastPurchase, riskScore, riskLevel, recommendations };
}

interface ListParams {
  search?: string;
  page: number;
  limit: number;
}

interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const customerService = {
  async list(userId: string, { search, page, limit }: ListParams) {
    const where = {
      userId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { sales: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async create(userId: string, input: CustomerInput) {
    return prisma.customer.create({
      data: {
        userId,
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        address: input.address || null,
      },
    });
  },

  async getById(userId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: { include: { product: { select: { name: true } } } },
            invoice: { select: { id: true, invoiceNumber: true, pdfUrl: true, chainStatus: true } },
            receipt: {
              select: { id: true, receiptNumber: true, pdfUrl: true, qrCodeUrl: true, chainStatus: true, documentHash: true },
            },
          },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return { ...customer, ...buildCustomerInsights(customer) };
  },

  async update(userId: string, id: string, input: Partial<CustomerInput>) {
    const existing = await prisma.customer.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Customer not found');
    }

    return prisma.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.email !== undefined ? { email: input.email || null } : {}),
        ...(input.address !== undefined ? { address: input.address || null } : {}),
      },
    });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.customer.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Customer not found');
    }

    // Sales keep their history; Customer relation is nullified (onDelete: SetNull in schema)
    await prisma.customer.delete({ where: { id } });
  },
};
