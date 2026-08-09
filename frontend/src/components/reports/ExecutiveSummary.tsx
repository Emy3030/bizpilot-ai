import { Sparkles, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportPeriod, ReportSummary } from '@/types/report';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

const PERIOD_COMPARISON_LABEL: Record<ReportPeriod, string> = {
  daily: 'yesterday',
  weekly: 'last week',
  monthly: 'last month',
};

function buildSummaryText(data: ReportSummary, period: ReportPeriod, currency: string): string {
  const { revenueChangePct, netProfitChangePct } = data.comparison;
  const comparisonLabel = PERIOD_COMPARISON_LABEL[period];
  const parts: string[] = [];

  if (data.salesCount === 0) {
    parts.push(`No sales recorded in this period.`);
  } else {
    parts.push(
      `Revenue was ${formatCurrency(data.revenue, currency)} from ${data.salesCount} sale${data.salesCount === 1 ? '' : 's'}, with ${formatCurrency(data.netProfit, currency)} net profit.`
    );
  }

  if (revenueChangePct !== null) {
    parts.push(
      revenueChangePct >= 0
        ? `That's up ${revenueChangePct}% compared to ${comparisonLabel}.`
        : `That's down ${Math.abs(revenueChangePct)}% compared to ${comparisonLabel}.`
    );
  } else if (data.comparison.previousRevenue === 0 && data.revenue > 0) {
    parts.push(`There was no revenue in the previous period to compare against.`);
  }

  if (data.bestSellingProducts.length > 0) {
    parts.push(`Your top seller was ${data.bestSellingProducts[0].name}.`);
  }

  if (netProfitChangePct !== null && netProfitChangePct < -10) {
    parts.push(`Net profit dropped notably — worth checking whether expenses grew faster than sales.`);
  }

  return parts.join(' ');
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" /> No prior data
      </span>
    );
  }
  const positive = pct >= 0;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', positive ? 'text-success' : 'text-destructive')}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

export function ExecutiveSummary({ data, period, currency }: { data: ReportSummary; period: ReportPeriod; currency: string }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold">Executive Summary</p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground/90">
              {buildSummaryText(data, period, currency)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-4 self-start rounded-xl border border-border bg-card px-4 py-3 sm:flex-col sm:gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Revenue vs {PERIOD_COMPARISON_LABEL[period]}</p>
            <ChangeBadge pct={data.comparison.revenueChangePct} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net profit vs {PERIOD_COMPARISON_LABEL[period]}</p>
            <ChangeBadge pct={data.comparison.netProfitChangePct} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
