import { Sparkles, AlertTriangle, Clock, Users, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { HealthScorePill } from '@/components/ui/health-score';
import { MissionControlSummary } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';

const PRIORITY_ICON = {
  approvals: Clock,
  low_stock: AlertTriangle,
  debt: Users,
  no_sales: ShoppingBag,
} as const;

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function buildBriefingText(summary: MissionControlSummary, currency: string, hasInsufficientData: boolean): string {
  if (hasInsufficientData) {
    return "Welcome to BizPilot. Once you add products, customers, and record a sale, I'll start tracking your business health and watching for anything that needs your attention.";
  }

  const { todayStats, pendingApprovalsCount } = summary;
  const parts: string[] = [];

  if (todayStats.salesCount > 0) {
    parts.push(
      `Today you've made ${todayStats.salesCount} sale${todayStats.salesCount === 1 ? '' : 's'}, bringing in ${formatCurrency(
        todayStats.revenue,
        currency
      )} with ${formatCurrency(todayStats.netProfit, currency)} net profit so far.`
    );
  } else {
    parts.push("No sales recorded yet today.");
  }

  parts.push(
    pendingApprovalsCount > 0
      ? `Your AI team has ${pendingApprovalsCount} action${pendingApprovalsCount === 1 ? '' : 's'} ready and waiting on your approval.`
      : "Nothing is waiting on your approval right now."
  );

  return parts.join(' ');
}

export function MissionBriefing({
  summary,
  currency,
  userName,
}: {
  summary: MissionControlSummary;
  currency: string;
  userName?: string;
}) {
  const hasInsufficientData = summary.recentTransactions.length === 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">
                {getTimeOfDayGreeting()}
                {userName ? `, ${userName}` : ''}.
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground/90">
                {buildBriefingText(summary, currency, hasInsufficientData)}
              </p>
            </div>
          </div>
          <HealthScorePill
            label="Business Health"
            score={summary.healthScore}
            status={summary.healthLabel}
            insufficientData={hasInsufficientData}
            className="self-start"
          />
        </div>

        {!hasInsufficientData && summary.priorities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            {summary.priorities.map((priority) => {
              const Icon = PRIORITY_ICON[priority.type];
              return (
                <div
                  key={priority.type}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {priority.label}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
