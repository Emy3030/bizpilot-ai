import prisma from '../config/prisma';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

function getRange(period: ReportPeriod, referenceDate: Date): { start: Date; end: Date } {
  if (period === 'daily') {
    return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
  }

  if (period === 'weekly') {
    const start = startOfDay(referenceDate);
    start.setDate(start.getDate() - start.getDay()); // back up to Sunday
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end: endOfDay(end) };
  }

  // monthly
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  return { start: startOfDay(start), end: endOfDay(end) };
}

function getPreviousReferenceDate(period: ReportPeriod, referenceDate: Date): Date {
  const prev = new Date(referenceDate);
  if (period === 'daily') prev.setDate(prev.getDate() - 1);
  if (period === 'weekly') prev.setDate(prev.getDate() - 7);
  if (period === 'monthly') prev.setMonth(prev.getMonth() - 1);
  return prev;
}

// null means "not a meaningful percentage" (e.g. went from 0 to something) —
// the frontend shows "new" instead of a misleading infinite/undefined swing.
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export const reportService = {
  async getSummary(userId: string, period: ReportPeriod, referenceDate: Date) {
    const { start, end } = getRange(period, referenceDate);
    const { start: prevStart, end: prevEnd } = getRange(period, getPreviousReferenceDate(period, referenceDate));

    const [salesAgg, expenseAgg, prevSalesAgg, prevExpenseAgg, salesForTrend, expensesForTrend, bestSellersRaw] =
      await Promise.all([
      prisma.sale.aggregate({
        where: { userId, createdAt: { gte: start, lte: end } },
        _sum: { totalAmount: true, profit: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { userId, createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.sale.aggregate({
        where: { userId, createdAt: { gte: prevStart, lte: prevEnd } },
        _sum: { totalAmount: true, profit: true },
      }),
      prisma.expense.aggregate({
        where: { userId, createdAt: { gte: prevStart, lte: prevEnd } },
        _sum: { amount: true },
      }),
      prisma.sale.findMany({
        where: { userId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true, totalAmount: true, profit: true },
      }),
      prisma.expense.findMany({
        where: { userId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true, amount: true },
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { userId, createdAt: { gte: start, lte: end } } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const productIds = bestSellersRaw.map((b) => b.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const bestSellingProducts = bestSellersRaw.map((b) => ({
      productId: b.productId,
      name: productMap.get(b.productId)?.name || 'Unknown product',
      imageUrl: productMap.get(b.productId)?.imageUrl || null,
      quantitySold: b._sum.quantity || 0,
      revenue: Number(b._sum.subtotal || 0),
    }));

    // Trend only makes sense as a multi-point series for weekly/monthly.
    let trend: { label: string; revenue: number; profit: number; expenses: number }[] = [];
    if (period !== 'daily') {
      const days = eachDay(start, end);
      const bucket = new Map(days.map((d) => [d.toISOString().slice(0, 10), { revenue: 0, profit: 0, expenses: 0 }]));

      for (const sale of salesForTrend) {
        const key = sale.createdAt.toISOString().slice(0, 10);
        const b = bucket.get(key);
        if (b) {
          b.revenue += Number(sale.totalAmount);
          b.profit += Number(sale.profit);
        }
      }
      for (const expense of expensesForTrend) {
        const key = expense.createdAt.toISOString().slice(0, 10);
        const b = bucket.get(key);
        if (b) b.expenses += Number(expense.amount);
      }

      trend = days.map((d) => {
        const key = d.toISOString().slice(0, 10);
        const values = bucket.get(key)!;
        return {
          label: d.toLocaleDateString('en-US', period === 'weekly' ? { weekday: 'short' } : { day: 'numeric' }),
          ...values,
        };
      });
    }

    const revenue = Number(salesAgg._sum.totalAmount || 0);
    const profit = Number(salesAgg._sum.profit || 0);
    const expenses = Number(expenseAgg._sum.amount || 0);
    const netProfit = Number((profit - expenses).toFixed(2));

    const previousRevenue = Number(prevSalesAgg._sum.totalAmount || 0);
    const previousProfit = Number(prevSalesAgg._sum.profit || 0);
    const previousExpenses = Number(prevExpenseAgg._sum.amount || 0);
    const previousNetProfit = Number((previousProfit - previousExpenses).toFixed(2));

    return {
      period,
      rangeStart: start,
      rangeEnd: end,
      revenue,
      profit,
      expenses,
      netProfit,
      salesCount: salesAgg._count,
      bestSellingProducts,
      trend,
      comparison: {
        revenueChangePct: pctChange(revenue, previousRevenue),
        netProfitChangePct: pctChange(netProfit, previousNetProfit),
        previousRevenue,
        previousNetProfit,
      },
    };
  },
};
