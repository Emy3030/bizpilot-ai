import { ReactNode } from 'react';
import { LucideIcon, ShieldCheck, Globe2, AlertTriangle, Zap, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { HeroStatCard } from '@/components/dashboard/HeroStatCard';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { CashFlowCard } from '@/components/dashboard/CashFlowCard';
import { BusinessHealthGrid } from '@/components/dashboard/BusinessHealthGrid';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RecentInvoices } from '@/components/dashboard/RecentInvoices';
import { MissionBriefing } from '@/components/dashboard/MissionBriefing';
import { AgentActivityFeed } from '@/components/dashboard/AgentActivityFeed';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { CustomerRisks } from '@/components/dashboard/CustomerRisks';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { FirstRunGuide } from '@/components/dashboard/FirstRunGuide';
import { InventoryInsights } from '@/components/inventory/InventoryInsights';
import { PendingApprovals } from '@/components/ai/PendingApprovals';
import { BusinessPulseFeed } from '@/components/home/BusinessPulseFeed';
import { CurrencyWatchCard } from '@/components/home/CurrencyWatchCard';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useMissionControl } from '@/hooks/useDashboardSummary';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

// One small local helper, reused for all four zones below, instead of four
// hand-written headers — keeps the grouping visually consistent without a
// new shared component file.
function SectionLabel({
  icon: Icon,
  title,
  tone = 'default',
  trailing,
}: {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'attention';
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', tone === 'attention' ? 'text-amber-500' : 'text-primary')} />
        <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
      </div>
      {trailing}
    </div>
  );
}

export default function MissionControlPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useMissionControl();
  const currency = user?.currency || 'NGN';

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <p className="font-medium">Couldn't load Mission Control</p>
            <p className="text-sm text-muted-foreground">
              Check that the API server is running and try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const {
    todayStats,
    lowStockCount,
    recentTransactions,
    weeklyTrend,
    cashFlow,
    recentAgentActivity,
    topDebtors,
    recentInvoices,
    businessHealth,
    pendingApprovalsCount,
  } = data;

  const needsAttention = pendingApprovalsCount > 0 || lowStockCount > 0 || topDebtors.length > 0;
  // Zero sales ever recorded (recentTransactions is an unbounded, most-recent
  // query — empty means empty) is the one reliable signal, from data already
  // on this object, that there's nothing yet to meaningfully assess.
  const hasInsufficientData = recentTransactions.length === 0;

  return (
    <AppLayout>
      <PageTransition>
        <FadeInSection className="mb-8">
          <MissionBriefing summary={data} currency={currency} userName={user?.name?.split(' ')[0]} />
        </FadeInSection>

        {/* BUSINESS HEALTH — is my business healthy? Score, then the numbers
            behind it, then the trend/cash-flow evidence. */}
        <section>
          <SectionLabel icon={ShieldCheck} title="Business Health" />

          {hasInsufficientData && (
            <FadeInSection className="mb-4">
              <FirstRunGuide />
            </FadeInSection>
          )}

          <FadeInSection delay={0.05} className="mb-4">
            <BusinessHealthGrid health={businessHealth} insufficientData={hasInsufficientData} />
          </FadeInSection>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FadeInSection delay={0.1}>
              <SalesTrendChart data={weeklyTrend} currency={currency} />
            </FadeInSection>
            <FadeInSection delay={0.12}>
              <CashFlowCard cashFlow={cashFlow} currency={currency} />
            </FadeInSection>
          </div>

          <FadeInSection delay={0.15} className="mt-4">
            <RecentTransactions items={recentTransactions} currency={currency} />
          </FadeInSection>
        </section>

        {/* ATTENTION NEEDED — what needs my attention right now? Grouped and
            visually flagged only when there's actually something to flag;
            a calm "all clear" state otherwise, so this section doesn't cry
            wolf on a normal day. */}
        <section className="mt-10">
          <SectionLabel
            icon={AlertTriangle}
            title="Attention Needed"
            tone={needsAttention ? 'attention' : 'default'}
            trailing={!needsAttention && <Badge variant="success">All clear</Badge>}
          />

          <div
            className={cn(
              'space-y-4',
              needsAttention && 'rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] p-4 sm:p-5'
            )}
          >
            <FadeInSection delay={0.05}>
              <PendingApprovals />
            </FadeInSection>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FadeInSection delay={0.08}>
                <CustomerRisks items={topDebtors} currency={currency} />
              </FadeInSection>
              <FadeInSection delay={0.1}>
                <StatCard
                  label="Low stock items"
                  value={String(lowStockCount)}
                  numericValue={lowStockCount}
                  formatValue={(n) => String(Math.round(n))}
                  icon={AlertTriangle}
                  accent={lowStockCount > 0 ? 'warning' : 'success'}
                />
              </FadeInSection>
            </div>

            <FadeInSection delay={0.12}>
              <InventoryInsights />
            </FadeInSection>
          </div>
        </section>

        {/* BUSINESS INTELLIGENCE — what's happening outside my business that
            might matter? Kept below the operational content, per the brief:
            useful context, not the headline. */}
        <section className="mt-10">
          <SectionLabel icon={Globe2} title="Market & Business Intelligence" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BusinessPulseFeed />
            </div>
            <CurrencyWatchCard currency={currency} />
          </div>
        </section>

        {/* ACTION — what should I do next, and what has the AI already done? */}
        <section className="mt-10">
          <SectionLabel icon={Zap} title="Action" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <FadeInSection delay={0.05}>
                <AIRecommendations />
              </FadeInSection>
              <FadeInSection delay={0.08}>
                <AgentActivityFeed items={recentAgentActivity} />
              </FadeInSection>
              <FadeInSection delay={0.1}>
                <RecentInvoices invoices={recentInvoices} currency={currency} />
              </FadeInSection>
            </div>
            <div className="space-y-4">
              <FadeInSection delay={0.05}>
                <QuickActions />
              </FadeInSection>
              <FadeInSection delay={0.08}>
                <UpcomingTasks />
              </FadeInSection>
            </div>
          </div>
        </section>
      </PageTransition>
    </AppLayout>
  );
}
