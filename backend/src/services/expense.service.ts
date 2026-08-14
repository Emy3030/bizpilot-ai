import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

interface ListParams {
  page: number;
  limit: number;
  categoryId?: string;
  from?: Date;
  to?: Date;
}

interface ExpenseInput {
  title: string;
  amount: number;
  categoryId?: string;
  note?: string;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(): Date {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth(): Date {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

async function assertCategoryOwned(userId: string, categoryId: string | null | undefined) {
  if (!categoryId) return;
  const category = await prisma.expenseCategory.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw ApiError.badRequest('Selected category was not found');
  }
}

export const expenseService = {
  async list(userId: string, { page, limit, categoryId, from, to }: ListParams) {
    const where = {
      userId,
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [expenses, total, sumAgg, categoryAverages] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
      // One aggregate query for the whole page, not one per row — avoids an
      // N+1 against a Postgres project with a hard connection-count cap.
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, categoryId: { not: null } },
        _avg: { amount: true },
        _count: true,
      }),
    ]);

    // "Unusual" is a simple, explainable heuristic — not fabricated:
    // an expense the AI flags as unusual is one that's genuinely more than
    // double that category's own average spend, with at least 3 prior
    // expenses in the category to make the average meaningful.
    const avgByCategory = new Map(categoryAverages.map((c) => [c.categoryId, { avg: Number(c._avg.amount || 0), count: c._count }]));
    const expensesWithFlags = expenses.map((e) => {
      const stats = e.categoryId ? avgByCategory.get(e.categoryId) : undefined;
      const isUnusual = !!stats && stats.count >= 3 && Number(e.amount) > stats.avg * 2;
      return { ...e, isUnusual };
    });

    return {
      expenses: expensesWithFlags,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      totalAmount: Number(sumAgg._sum.amount || 0),
    };
  },

  async create(userId: string, input: ExpenseInput) {
    await assertCategoryOwned(userId, input.categoryId);
    return prisma.expense.create({
      data: {
        userId,
        title: input.title,
        amount: input.amount,
        categoryId: input.categoryId || null,
        note: input.note || null,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async update(userId: string, id: string, input: Partial<ExpenseInput>) {
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Expense not found');
    }
    if (input.categoryId !== undefined) {
      await assertCategoryOwned(userId, input.categoryId);
    }
    return prisma.expense.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.amount !== undefined ? { amount: input.amount } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
        ...(input.note !== undefined ? { note: input.note || null } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      throw ApiError.notFound('Expense not found');
    }
    await prisma.expense.delete({ where: { id } });
  },

  async getSummary(userId: string) {
    const [todayAgg, weekAgg, monthAgg, byCategory] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId, createdAt: { gte: startOfToday(), lte: endOfToday() } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { userId, createdAt: { gte: startOfWeek() } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, createdAt: { gte: startOfMonth() } },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: { userId, createdAt: { gte: startOfMonth() } },
        _sum: { amount: true },
      }),
    ]);

    const categoryIds = byCategory.map((b) => b.categoryId).filter((id): id is string => !!id);
    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    return {
      today: { total: Number(todayAgg._sum.amount || 0), count: todayAgg._count },
      thisWeek: { total: Number(weekAgg._sum.amount || 0) },
      thisMonth: { total: Number(monthAgg._sum.amount || 0) },
      monthByCategory: byCategory.map((b) => ({
        categoryId: b.categoryId,
        categoryName: b.categoryId ? categoryMap.get(b.categoryId) || 'Uncategorized' : 'Uncategorized',
        total: Number(b._sum.amount || 0),
      })),
    };
  },
};
