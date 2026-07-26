import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export const expenseCategoryService = {
  async list(userId: string) {
    return prisma.expenseCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { expenses: true } } },
    });
  },

  async create(userId: string, name: string) {
    const existing = await prisma.expenseCategory.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) {
      throw ApiError.conflict('An expense category with this name already exists');
    }
    return prisma.expenseCategory.create({ data: { userId, name } });
  },

  async update(userId: string, id: string, name: string) {
    const existing = await prisma.expenseCategory.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Expense category not found');
    }
    return prisma.expenseCategory.update({ where: { id }, data: { name } });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.expenseCategory.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Expense category not found');
    }
    // Expenses keep their history; category relation is nullified (onDelete: SetNull in schema)
    await prisma.expenseCategory.delete({ where: { id } });
  },
};
