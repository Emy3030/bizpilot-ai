import { useState } from 'react';
import { DollarSign, TrendingUp, Trophy } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { StatCard } from '@/components/dashboard/StatCard';
import { BusinessPulseFeed } from '@/components/home/BusinessPulseFeed';
import { CurrencyWatchCard } from '@/components/home/CurrencyWatchCard';
import { BestSellingProducts } from '@/components/reports/BestSellingProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useReportSummary } from '@/hooks/useReports';
import { formatCurrency } from '@/utils/formatCurrency';

export default function HomePage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  // Computed once on mount, not on every render — a fresh `new Date()` on
  // every render was creating a new React Query cache key each time,
  // causing an infinite refetch loop (this was flooding the backend and
  // triggering the rate limiter).
  const [todayIso] = useState(() => new Date().toISOString());

  const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary();
  const { data: report, isLoading: reportLoading } = useReportSummary({
    period: 'daily',
    date: todayIso,
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppLayout>
      <PageTransition>
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.businessName} · {today}
          </p>
        </div>

        {dashboardLoading || !dashboard ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Today's revenue"
              value={formatCurrency(dashboard.todayStats.revenue, currency)}
              numericValue={dashboard.todayStats.revenue}
              formatValue={(n) => formatCurrency(n, currency)}
              icon={DollarSign}
              accent="primary"
            />
            <StatCard
              label="Today's net profit"
              value={formatCurrency(dashboard.todayStats.netProfit, currency)}
              numericValue={dashboard.todayStats.netProfit}
              formatValue={(n) => formatCurrency(n, currency)}
              icon={TrendingUp}
              accent="success"
              delay={0.05}
            />
            <StatCard
              label="Top seller today"
              value={report?.bestSellingProducts[0]?.name ?? 'No sales yet'}
              icon={Trophy}
              accent="warning"
              delay={0.1}
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FadeInSection delay={0.1}>
              <BusinessPulseFeed />
            </FadeInSection>
          </div>
          <div className="space-y-6">
            <FadeInSection delay={0.1}>
              {reportLoading || !report ? (
                <Skeleton className="h-64 rounded-2xl" />
              ) : (
                <BestSellingProducts products={report.bestSellingProducts} currency={currency} />
              )}
            </FadeInSection>
            <FadeInSection delay={0.15}>
              <CurrencyWatchCard currency={currency} />
            </FadeInSection>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
