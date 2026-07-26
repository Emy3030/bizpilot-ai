import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

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
          include: { items: { include: { product: { select: { name: true } } } } },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return customer;
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
