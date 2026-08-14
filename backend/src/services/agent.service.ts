import prisma from '../config/prisma';
import { dashboardService } from './dashboard.service';
import { productService } from './product.service';

export interface AgentSummary {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  status: string;
  recentActivity: string[];
  recommendation: string | null;
  /** 0-100 — how much real data backs this agent's current view, not a
   *  model's self-reported certainty. More signal (sales, actions, history)
   *  raises it; it's derived the same way the Mission Control health score
   *  is, not fabricated. */
  confidence: number;
}

function clampConfidence(n: number): number {
  return Math.max(20, Math.min(97, Math.round(n)));
}

/**
 * The COO orchestrates; the other seven are views over the same real
 * business data (Mission Control, inventory insights, agent action history)
 * filtered/framed by responsibility — not seven separate chat models. Any
 * agent with no wired capability yet (Marketing) says so honestly rather
 * than fabricating activity.
 */
export const agentService = {
  async getAgents(userId: string): Promise<AgentSummary[]> {
    const [missionControl, insights, pendingActions, recentActions, documentCounts] = await Promise.all([
      dashboardService.getMissionControl(userId),
      productService.getInventoryInsights(userId),
      prisma.agentAction.findMany({ where: { userId, status: 'PENDING' }, orderBy: { createdAt: 'desc' } }),
      prisma.agentAction.findMany({
        where: { userId, status: { in: ['EXECUTED', 'REJECTED', 'FAILED'] } },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
      Promise.all([prisma.invoice.count({ where: { userId } }), prisma.receipt.count({ where: { userId } })]),
    ]);

    const [invoiceCount, receiptCount] = documentCounts;
    const salesActions = recentActions.filter((a) => a.type === 'RECORD_SALE');
    const customerActions = recentActions.filter((a) => a.type === 'CREATE_CUSTOMER');
    const executedActions = recentActions.filter((a) => a.status === 'EXECUTED');
    const { todayStats, lowStockCount, topDebtors, debtorCount, pendingApprovalsCount } = missionControl;

    const agents: AgentSummary[] = [
      {
        id: 'coo',
        name: 'COO Agent',
        role: 'Orchestrator',
        responsibility: "Coordinates every agent below, prioritizes what matters, and prepares your morning briefing.",
        status:
          pendingApprovalsCount > 0
            ? `${pendingApprovalsCount} action${pendingApprovalsCount === 1 ? '' : 's'} awaiting your approval`
            : 'All caught up — nothing waiting on you',
        recentActivity: recentActions.slice(0, 3).map((a) => a.summary),
        recommendation: pendingActions[0]?.summary ?? null,
        confidence: clampConfidence(70 + recentActions.length),
      },
      {
        id: 'finance',
        name: 'Finance Agent',
        role: 'Cash flow & profit',
        responsibility: 'Tracks revenue, margins, and expenses — flags anything that would hurt cash flow.',
        status:
          todayStats.salesCount === 0
            ? 'No sales yet today'
            : todayStats.netProfit >= 0
              ? 'Profitable today'
              : 'Expenses exceeding revenue today',
        recentActivity: [],
        recommendation: todayStats.netProfit < 0 ? 'Net profit is negative today — worth reviewing recent expenses.' : null,
        confidence: clampConfidence(50 + todayStats.salesCount * 4),
      },
      {
        id: 'sales',
        name: 'Sales Agent',
        role: 'Revenue & pipeline',
        responsibility: 'Spots slowing sales trends and drafts follow-ups worth sending.',
        status: `${todayStats.salesCount} sale${todayStats.salesCount === 1 ? '' : 's'} today`,
        recentActivity: salesActions.slice(0, 3).map((a) => a.summary),
        recommendation: todayStats.salesCount === 0 ? 'No sales recorded yet today.' : null,
        confidence: clampConfidence(45 + salesActions.length * 6),
      },
      {
        id: 'inventory',
        name: 'Inventory Agent',
        role: 'Stock & supply',
        responsibility: 'Predicts stockouts from real sales velocity and proposes restocks before they happen.',
        status:
          insights.restockRecommendations.length > 0
            ? `${insights.restockRecommendations.length} product${insights.restockRecommendations.length === 1 ? '' : 's'} need restocking soon`
            : lowStockCount > 0
              ? `${lowStockCount} low on stock`
              : 'Stock levels healthy',
        recentActivity: recentActions.filter((a) => a.type === 'RECORD_SALE').length
          ? []
          : [],
        recommendation:
          insights.restockRecommendations.length > 0
            ? `Restock ${insights.restockRecommendations[0].name} — projected out in ~${insights.restockRecommendations[0].daysUntilStockout}d`
            : null,
        confidence: clampConfidence(40 + insights.fastMoving.length * 8),
      },
      {
        id: 'marketing',
        name: 'Marketing Agent',
        role: 'Campaigns & offers',
        responsibility: 'Drafts ready-to-send promotions grounded in real sales and stock data.',
        status: 'Ready — no campaigns run yet',
        recentActivity: [],
        recommendation:
          insights.slowMoving.length > 0
            ? `${insights.slowMoving[0].name} has had no sales in 30 days — a discount push could move it.`
            : null,
        confidence: clampConfidence(35),
      },
      {
        id: 'customer-success',
        name: 'Customer Success Agent',
        role: 'Retention & risk',
        responsibility: 'Watches for customers going quiet or debt building up.',
        status:
          debtorCount > 0
            ? `${debtorCount} customer${debtorCount === 1 ? '' : 's'} with outstanding balances`
            : 'No customers at risk',
        recentActivity: customerActions.slice(0, 3).map((a) => a.summary),
        recommendation: topDebtors[0] ? `Follow up with ${topDebtors[0].name} — outstanding balance on file.` : null,
        confidence: clampConfidence(40 + customerActions.length * 6),
      },
      {
        id: 'operations',
        name: 'Operations Agent',
        role: 'Day-to-day execution',
        responsibility: 'Executes approved actions and keeps the day-to-day work moving.',
        status: `${executedActions.length} action${executedActions.length === 1 ? '' : 's'} executed recently`,
        recentActivity: executedActions.slice(0, 3).map((a) => a.summary),
        recommendation: null,
        confidence: clampConfidence(45 + executedActions.length * 5),
      },
      {
        id: 'document',
        name: 'Document Agent',
        role: 'Invoices & trust',
        responsibility: 'Generates invoices and receipts, and anchors them on-chain for tamper-proof records.',
        status: `${invoiceCount + receiptCount} trust document${invoiceCount + receiptCount === 1 ? '' : 's'} on file`,
        recentActivity: [],
        recommendation: null,
        confidence: clampConfidence(50 + (invoiceCount + receiptCount) * 3),
      },
    ];

    return agents;
  },
};
