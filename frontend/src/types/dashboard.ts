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
