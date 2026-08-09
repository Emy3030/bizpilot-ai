import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, Wallet, ShoppingBag, Download } from 'lucide-react';
import { toast } from 'sonner';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatCard } from '@/components/dashboard/StatCard';
import { PageTransition } from '@/components/motion/PageTransition';
import { FadeInSection } from '@/components/motion/FadeInSection';
import { ReportPeriodSelector } from '@/components/reports/ReportPeriodSelector';
import { ReportTrendChart } from '@/components/reports/ReportTrendChart';
import { BestSellingProducts } from '@/components/reports/BestSellingProducts';
import { ExecutiveSummary } from '@/components/reports/ExecutiveSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { useReportSummary } from '@/hooks/useReports';
import { useAuth } from '@/context/AuthContext';
import { ReportPeriod, ReportSummary } from '@/types/report';
import { formatCurrency } from '@/utils/formatCurrency';
import { downloadCsv } from '@/utils/downloadCsv';

function shiftDate(date: Date, period: ReportPeriod, direction: 1 | -1): Date {
  const next = new Date(date);
  if (period === 'daily') next.setDate(next.getDate() + direction);
  if (period === 'weekly') next.setDate(next.getDate() + direction * 7);
  if (period === 'monthly') next.setMonth(next.getMonth() + direction);
  return next;
}

function formatRangeLabel(period: ReportPeriod, date: Date): string {
  if (period === 'daily') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (period === 'weekly') {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function exportReportCsv(data: ReportSummary, period: ReportPeriod, rangeLabel: string, currency: string) {
  const rows: (string | number)[][] = [
    [`BizPilot — ${period} report`],
    ['Range', rangeLabel],
    [],
    ['Metric', 'Value'],
    ['Revenue', formatCurrency(data.revenue, currency)],
    ['Net profit', formatCurrency(data.netProfit, currency)],
    ['Expenses', formatCurrency(data.expenses, currency)],
    ['Sales count', data.salesCount],
    [],
    ['Best-selling products', 'Quantity sold', 'Revenue'],
    ...data.bestSellingProducts.map((p) => [p.name, p.quantitySold, formatCurrency(p.revenue, currency)]),
  ];

  if (data.trend.length > 0) {
    rows.push([], ['Date', 'Revenue', 'Profit', 'Expenses']);
    rows.push(...data.trend.map((t) => [t.label, t.revenue, t.profit, t.expenses]));
  }

  const filename = `bizpilot-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCsv(filename, rows);
  toast.success('Report exported');
}

export default function ReportsPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'NGN';

  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [referenceDate, setReferenceDate] = useState(new Date());

  const { data, isLoading } = useReportSummary({ period, date: referenceDate.toISOString() });

  const rangeLabel = useMemo(() => formatRangeLabel(period, referenceDate), [period, referenceDate]);
  const isCurrentPeriod = useMemo(() => {
    const next = shiftDate(referenceDate, period, 1);
    return next > new Date();
  }, [referenceDate, period]);

  return (
    <AppLayout>
      <PageTransition>
        <SectionHeading
          title="Reports"
          description="Revenue, profit, expenses and best sellers over time"
          action={
            <Button variant="outline" onClick={() => data && exportReportCsv(data, period, rangeLabel, currency)} disabled={!data}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          }
        />

        <FadeInSection delay={0.05} className="mb-6">
          <ReportPeriodSelector
            period={period}
            onPeriodChange={(p) => {
              setPeriod(p);
              setReferenceDate(new Date());
            }}
            rangeLabel={rangeLabel}
            onPrev={() => setReferenceDate((d) => shiftDate(d, period, -1))}
            onNext={() => setReferenceDate((d) => shiftDate(d, period, 1))}
            nextDisabled={isCurrentPeriod}
          />
        </FadeInSection>

        {isLoading || !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <FadeInSection delay={0.05} className="mb-6">
              <ExecutiveSummary data={data} period={period} currency={currency} />
            </FadeInSection>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Revenue"
                value={formatCurrency(data.revenue, currency)}
                numericValue={data.revenue}
                formatValue={(n) => formatCurrency(n, currency)}
                icon={DollarSign}
                accent="primary"
              />
              <StatCard
                label="Net profit"
                value={formatCurrency(data.netProfit, currency)}
                numericValue={data.netProfit}
                formatValue={(n) => formatCurrency(n, currency)}
                icon={TrendingUp}
                accent="success"
                delay={0.05}
              />
              <StatCard
                label="Expenses"
                value={formatCurrency(data.expenses, currency)}
                numericValue={data.expenses}
                formatValue={(n) => formatCurrency(n, currency)}
                icon={Wallet}
                accent="destructive"
                delay={0.1}
              />
              <StatCard
                label="Sales count"
                value={String(data.salesCount)}
                numericValue={data.salesCount}
                formatValue={(n) => String(Math.round(n))}
                icon={ShoppingBag}
                accent="primary"
                delay={0.15}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FadeInSection delay={0.1}>
                  {data.trend.length > 0 ? (
                    <ReportTrendChart data={data.trend} currency={currency} />
                  ) : (
                    <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                      Switch to Weekly or Monthly to see the trend chart.
                    </div>
                  )}
                </FadeInSection>
              </div>
              <FadeInSection delay={0.15}>
                <BestSellingProducts products={data.bestSellingProducts} currency={currency} />
              </FadeInSection>
            </div>
          </>
        )}
      </PageTransition>
    </AppLayout>
  );
}
