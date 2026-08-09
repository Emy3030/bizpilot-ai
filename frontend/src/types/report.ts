export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface BestSellingProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantitySold: number;
  revenue: number;
}

export interface ReportTrendPoint {
  label: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface ReportComparison {
  revenueChangePct: number | null;
  netProfitChangePct: number | null;
  previousRevenue: number;
  previousNetProfit: number;
}

export interface ReportSummary {
  period: ReportPeriod;
  rangeStart: string;
  rangeEnd: string;
  revenue: number;
  profit: number;
  expenses: number;
  netProfit: number;
  salesCount: number;
  bestSellingProducts: BestSellingProduct[];
  trend: ReportTrendPoint[];
  comparison: ReportComparison;
}
