import { DollarSign, TrendingUp, ShoppingBag, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { HeroStatCard } from '@/components/dashboard/HeroStatCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { LowStockList } from '@/components/dashboard/LowStockList';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { formatCurrency } from '@/utils/formatCurrency';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboardSummary();
  const currency = user?.currency || 'NGN';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-32 w-full rounded-2xl sm:col-span-2 lg:col-span-2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="font-medium">Couldn't load your dashboard</p>
            <p className="text-sm text-muted-foreground">
              Check that the API server is running and try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const { todayStats, lowStock, lowStockCount, recentTransactions, weeklyTrend } = data;

  return (
    <AppLayout>
      <PageTransition>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <HeroStatCard
              label="Today's sales"
              numericValue={todayStats.revenue}
              formatValue={(n) => formatCurrency(n, currency)}
              icon={DollarSign}
              subtext={`${todayStats.salesCount} transaction${todayStats.salesCount === 1 ? '' : 's'} today`}
            />
          </div>
          <StatCard
            label="Today's profit"
            value={formatCurrency(todayStats.netProfit, currency)}
            numericValue={todayStats.netProfit}
            formatValue={(n) => formatCurrency(n, currency)}
            icon={TrendingUp}
            accent="success"
            delay={0.05}
          />
          <StatCard
            label="Transactions today"
            value={String(todayStats.salesCount)}
            numericValue={todayStats.salesCount}
            formatValue={(n) => String(Math.round(n))}
            icon={ShoppingBag}
            accent="primary"
            delay={0.1}
          />
          <StatCard
            label="Low stock items"
            value={String(lowStockCount)}
            numericValue={lowStockCount}
            formatValue={(n) => String(Math.round(n))}
            icon={AlertTriangle}
            accent={lowStockCount > 0 ? 'warning' : 'success'}
            delay={0.15}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FadeInSection delay={0.1}>
              <SalesTrendChart data={weeklyTrend} currency={currency} />
            </FadeInSection>
            <FadeInSection delay={0.15}>
              <RecentTransactions items={recentTransactions} currency={currency} />
            </FadeInSection>
          </div>
          <div className="space-y-6">
            <FadeInSection delay={0.1}>
              <AIInsightsCard summary={data} currency={currency} />
            </FadeInSection>
            <FadeInSection delay={0.15}>
              <QuickActions />
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <LowStockList items={lowStock} />
            </FadeInSection>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
