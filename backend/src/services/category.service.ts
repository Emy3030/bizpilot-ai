import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export const categoryService = {
  async list(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  },

  async create(userId: string, name: string) {
    const existing = await prisma.category.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return prisma.category.create({ data: { userId, name } });
  },

  async update(userId: string, id: string, name: string) {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Category not found');
    }
    return prisma.category.update({ where: { id }, data: { name } });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Category not found');
    }
    // Products keep their history; Category relation is nullified (onDelete: SetNull in schema)
    await prisma.category.delete({ where: { id } });
  },
};
