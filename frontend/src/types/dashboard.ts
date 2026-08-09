export interface TodayStats {
  revenue: number;
  profit: number;
  expenses: number;
  netProfit: number;
  salesCount: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string | null;
}

export interface WeeklyTrendPoint {
  date: string;
  revenue: number;
  profit: number;
}

export interface RecentTransaction {
  id: string;
  customerName: string;
  itemsSummary: string;
  totalAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  createdAt: string;
}

export interface DashboardSummary {
  todayStats: TodayStats;
  lowStock: LowStockProduct[];
  lowStockCount: number;
  totalCustomers: number;
  weeklyTrend: WeeklyTrendPoint[];
  recentTransactions: RecentTransaction[];
}

export type HealthLabel = 'Strong' | 'Steady' | 'Needs attention' | 'At risk';

export interface Priority {
  type: 'approvals' | 'low_stock' | 'debt' | 'no_sales';
  label: string;
}

export interface AgentActivityItem {
  id: string;
  type: 'CREATE_CUSTOMER' | 'RECORD_SALE' | 'RESTOCK_PRODUCT';
  status: 'EXECUTED' | 'REJECTED' | 'FAILED';
  summary: string;
  createdAt: string;
}

export interface TopDebtor {
  id: string;
  name: string;
  outstandingDebt: number;
}

export interface MissionControlSummary extends DashboardSummary {
  healthScore: number;
  healthLabel: HealthLabel;
  priorities: Priority[];
  pendingApprovalsCount: number;
  recentAgentActivity: AgentActivityItem[];
  topDebtors: TopDebtor[];
}
