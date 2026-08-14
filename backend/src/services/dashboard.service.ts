import prisma from '../config/prisma';
import { agentActionService } from './agentAction.service';

type HealthLabel = 'Strong' | 'Steady' | 'Needs attention' | 'At risk';

interface HealthResult {
  score: number;
  label: HealthLabel;
}

function scoreToLabel(score: number): HealthLabel {
  return score >= 80 ? 'Strong' : score >= 60 ? 'Steady' : score >= 40 ? 'Needs attention' : 'At risk';
}

function toHealthResult(score: number): HealthResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { score: clamped, label: scoreToLabel(clamped) };
}

interface BusinessHealthInput {
  todayNetProfit: number;
  salesCountToday: number;
  cashFlowNet: number;
  pendingApprovalsCount: number;
  debtorCount: number;
  totalCustomers: number;
  lowStockCount: number;
  totalProducts: number;
}

// Five simple, explainable heuristics — not a model, on purpose. Each one
// only uses numbers already visible elsewhere on Mission Control, so a
// score never claims to know something the owner can't already verify
// themselves. The overall score is their average, not a separate formula.
function computeBusinessHealth(input: BusinessHealthInput) {
  let revenue = 100;
  if (input.salesCountToday === 0) revenue -= 30;
  if (input.todayNetProfit < 0) revenue -= 30;

  const cashFlow = input.cashFlowNet >= 0 ? 90 : 40;

  const operations = 100 - Math.min(input.pendingApprovalsCount * 8, 60);

  const debtRatio = input.totalCustomers > 0 ? input.debtorCount / input.totalCustomers : 0;
  const customers = 100 - debtRatio * 100;

  const lowStockRatio = input.totalProducts > 0 ? input.lowStockCount / input.totalProducts : 0;
  const inventory = 100 - lowStockRatio * 100;

  const breakdown = {
    revenue: toHealthResult(revenue),
    cashFlow: toHealthResult(cashFlow),
    operations: toHealthResult(operations),
    customers: toHealthResult(customers),
    inventory: toHealthResult(inventory),
  };

  const overall = toHealthResult(
    (breakdown.revenue.score +
      breakdown.cashFlow.score +
      breakdown.operations.score +
      breakdown.customers.score +
      breakdown.inventory.score) /
      5
  );

  return { breakdown, overall };
}

interface Priority {
  type: 'approvals' | 'low_stock' | 'debt' | 'no_sales';
  label: string;
}

function buildPriorities(
  lowStockCount: number,
  debtorCount: number,
  pendingApprovalsCount: number,
  salesCountToday: number
): Priority[] {
  const priorities: Priority[] = [];
  if (pendingApprovalsCount > 0) {
    priorities.push({
      type: 'approvals',
      label: `${pendingApprovalsCount} AI-prepared action${pendingApprovalsCount === 1 ? '' : 's'} awaiting your approval`,
    });
  }
  if (lowStockCount > 0) {
    priorities.push({ type: 'low_stock', label: `${lowStockCount} product${lowStockCount === 1 ? '' : 's'} running low on stock` });
  }
  if (debtorCount > 0) {
    priorities.push({
      type: 'debt',
      label: `${debtorCount} customer${debtorCount === 1 ? ' has' : 's have'} an outstanding balance`,
    });
  }
  if (salesCountToday === 0) {
    priorities.push({ type: 'no_sales', label: 'No sales recorded yet today' });
  }
  return priorities;
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
      select: { createdAt: true, totalAmount: true, profit: true, amountPaid: true },
    });

    // 7. Weekly expenses, for the cash-flow outflow side of the same window
    const weekExpensesRaw = await prisma.expense.findMany({
      where: { userId, createdAt: { gte: daysAgo(6) } },
      select: { createdAt: true, amount: true },
    });

    // --- Data Processing Pipeline remains unchanged ---
    const lowStockProducts = allProducts
      .filter((p) => p.stockQuantity <= p.lowStockThreshold)
      .slice(0, 10);

    const trendMap = new Map<string, { revenue: number; profit: number }>();
    const cashFlowMap = new Map<string, { inflow: number; outflow: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(key, { revenue: 0, profit: 0 });
      cashFlowMap.set(key, { inflow: 0, outflow: 0 });
    }
    for (const sale of weekTrendRaw) {
      const key = sale.createdAt.toISOString().slice(0, 10);
      const bucket = trendMap.get(key);
      if (bucket) {
        bucket.revenue += Number(sale.totalAmount);
        bucket.profit += Number(sale.profit);
      }
      const cashBucket = cashFlowMap.get(key);
      if (cashBucket) cashBucket.inflow += Number(sale.amountPaid);
    }
    for (const expense of weekExpensesRaw) {
      const key = expense.createdAt.toISOString().slice(0, 10);
      const cashBucket = cashFlowMap.get(key);
      if (cashBucket) cashBucket.outflow += Number(expense.amount);
    }
    const weeklyTrend = Array.from(trendMap.entries()).map(([date, values]) => ({
      date,
      revenue: Number(values.revenue.toFixed(2)),
      profit: Number(values.profit.toFixed(2)),
    }));
    const cashFlowTrend = Array.from(cashFlowMap.entries()).map(([date, values]) => ({
      date,
      inflow: Number(values.inflow.toFixed(2)),
      outflow: Number(values.outflow.toFixed(2)),
      net: Number((values.inflow - values.outflow).toFixed(2)),
    }));
    const cashInflow = Number(cashFlowTrend.reduce((sum, d) => sum + d.inflow, 0).toFixed(2));
    const cashOutflow = Number(cashFlowTrend.reduce((sum, d) => sum + d.outflow, 0).toFixed(2));

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
      totalProducts: allProducts.length,
      totalCustomers,
      weeklyTrend,
      cashFlow: {
        inflow: cashInflow,
        outflow: cashOutflow,
        net: Number((cashInflow - cashOutflow).toFixed(2)),
        trend: cashFlowTrend,
      },
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

  async getMissionControl(userId: string) {
    // Proactive detection pass — the Inventory Agent queues restock
    // proposals here (if any are newly urgent) before we read pending
    // actions below, so a fresh risk shows up in the same page load.
    await agentActionService.checkInventoryRisks(userId);

    const [summary, pendingActions, recentActions, topDebtors, debtorCount, recentInvoices] = await Promise.all([
      this.getSummary(userId),
      prisma.agentAction.findMany({ where: { userId, status: 'PENDING' } }),
      prisma.agentAction.findMany({
        where: { userId, status: { in: ['EXECUTED', 'REJECTED', 'FAILED'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.customer.findMany({
        where: { userId, outstandingDebt: { gt: 0 } },
        orderBy: { outstandingDebt: 'desc' },
        take: 5,
        select: { id: true, name: true, outstandingDebt: true },
      }),
      prisma.customer.count({ where: { userId, outstandingDebt: { gt: 0 } } }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          chainStatus: true,
          createdAt: true,
          sale: { select: { totalAmount: true, customer: { select: { name: true } } } },
        },
      }),
    ]);

    const { breakdown: businessHealth, overall: health } = computeBusinessHealth({
      todayNetProfit: summary.todayStats.netProfit,
      salesCountToday: summary.todayStats.salesCount,
      cashFlowNet: summary.cashFlow.net,
      pendingApprovalsCount: pendingActions.length,
      debtorCount,
      totalCustomers: summary.totalCustomers,
      lowStockCount: summary.lowStockCount,
      totalProducts: summary.totalProducts,
    });
    const priorities = buildPriorities(
      summary.lowStockCount,
      debtorCount,
      pendingActions.length,
      summary.todayStats.salesCount
    );

    return {
      ...summary,
      healthScore: health.score,
      healthLabel: health.label,
      businessHealth,
      priorities,
      pendingApprovalsCount: pendingActions.length,
      debtorCount,
      recentAgentActivity: recentActions.map((a) => ({
        id: a.id,
        type: a.type,
        status: a.status,
        summary: a.summary,
        createdAt: a.createdAt,
      })),
      topDebtors: topDebtors.map((d) => ({ id: d.id, name: d.name, outstandingDebt: Number(d.outstandingDebt) })),
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        chainStatus: inv.chainStatus,
        createdAt: inv.createdAt,
        customerName: inv.sale.customer?.name || 'Walk-in customer',
        totalAmount: Number(inv.sale.totalAmount),
      })),
    };
  },
};