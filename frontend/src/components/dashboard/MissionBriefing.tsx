import { Sparkles, AlertTriangle, Clock, Users, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MissionControlSummary, HealthLabel } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

const PRIORITY_ICON = {
  approvals: Clock,
  low_stock: AlertTriangle,
  debt: Users,
  no_sales: ShoppingBag,
} as const;

const HEALTH_STYLES: Record<HealthLabel, string> = {
  Strong: 'border-success/30 bg-success/10 text-success',
  Steady: 'border-primary/30 bg-primary/10 text-primary',
  'Needs attention': 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'At risk': 'border-destructive/30 bg-destructive/10 text-destructive',
};

function buildBriefingText(summary: MissionControlSummary, currency: string): string {
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

export function MissionBriefing({ summary, currency }: { summary: MissionControlSummary; currency: string }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">Morning Briefing</p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground/90">
                {buildBriefingText(summary, currency)}
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium',
              HEALTH_STYLES[summary.healthLabel]
            )}
          >
            Business Health: {summary.healthLabel} ({summary.healthScore})
          </div>
        </div>

        {summary.priorities.length > 0 && (
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
