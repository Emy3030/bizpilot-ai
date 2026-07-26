import prisma from '../config/prisma';

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

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const dashboardService = {
  async getSummary(userId: string) {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    // 1. Run the daily sales query
    const todaySalesAgg = await prisma.sale.aggregate({
      where: { userId, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { totalAmount: true, profit: true },
      _count: true,
    });

    // 2. Run the daily expenses query
    const todayExpensesAgg = await prisma.expense.aggregate({
      where: { userId, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
    });

    // 3. Retrieve stock details
    const allProducts = await prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true, imageUrl: true },
      orderBy: { stockQuantity: 'asc' },
    });

    // 4. Retrieve recent transaction records
    const recentSales = await prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // 5. Query total client accounts count
    const totalCustomers = await prisma.customer.count({ where: { userId } });

    // 6. Query weekly timeline data
    const weekTrendRaw = await prisma.sale.findMany({
      where: { userId, createdAt: { gte: daysAgo(6) } },
      select: { createdAt: true, totalAmount: true, profit: true },
    });

    // --- Data Processing Pipeline remains unchanged ---
    const lowStockProducts = allProducts
      .filter((p) => p.stockQuantity <= p.lowStockThreshold)
      .slice(0, 10);

    const trendMap = new Map<string, { revenue: number; profit: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(key, { revenue: 0, profit: 0 });
    }
    for (const sale of weekTrendRaw) {
      const key = sale.createdAt.toISOString().slice(0, 10);
      const bucket = trendMap.get(key);
      if (bucket) {
        bucket.revenue += Number(sale.totalAmount);
        bucket.profit += Number(sale.profit);
      }
    }
    const weeklyTrend = Array.from(trendMap.entries()).map(([date, values]) => ({
      date,
      revenue: Number(values.revenue.toFixed(2)),
      profit: Number(values.profit.toFixed(2)),
    }));

    const todayRevenue = Number(todaySalesAgg._sum.totalAmount || 0);
    const todayProfit = Number(todaySalesAgg._sum.profit || 0);
    const todayExpenses = Number(todayExpensesAgg._sum.amount || 0);

    return {
      todayStats: {
        revenue: todayRevenue,
        profit: todayProfit,
        expenses: todayExpenses,
        netProfit: Number((todayProfit - todayExpenses).toFixed(2)),
        salesCount: todaySalesAgg._count,
      },
      lowStock: lowStockProducts,
      lowStockCount: lowStockProducts.length,
      totalCustomers,
      weeklyTrend,
      recentTransactions: recentSales.map((s) => ({
        id: s.id,
        customerName: s.customer?.name || 'Walk-in customer',
        itemsSummary: s.items.map((i) => i.product.name).slice(0, 3).join(', '),
        totalAmount: Number(s.totalAmount),
        paymentStatus: s.paymentStatus,
        createdAt: s.createdAt,
      })),
    };
  },
};