import { DollarSign, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import { HealthScorePill } from '@/components/ui/health-score';
import { MissionControlSummary } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/utils/cn';

interface BusinessContextBarProps {
  summary: MissionControlSummary;
  currency: string;
  recommendationsCount: number;
}

/** Sits at the top of the AI COO page so the conversation opens with real
 *  situational awareness — the same numbers the COO agent itself reasons
 *  over — instead of a blank chat box. Every value here is read straight off
 *  Mission Control / the agent team; nothing here is generated for display. */
export function BusinessContextBar({ summary, currency, recommendationsCount }: BusinessContextBarProps) {
  const { todayStats, pendingApprovalsCount } = summary;

  const stats = [
    {
      icon: DollarSign,
      label: "Today's revenue",
      value: formatCurrency(todayStats.revenue, currency),
    },
    {
      icon: Clock,
      label: 'Awaiting approval',
      value: String(pendingApprovalsCount),
      tone: pendingApprovalsCount > 0 ? 'text-amber-600 dark:text-amber-400' : undefined,
    },
    {
      icon: Lightbulb,
      label: 'Agent recommendations',
      value: String(recommendationsCount),
      tone: recommendationsCount > 0 ? 'text-primary' : undefined,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
      <HealthScorePill label="Business Health" score={summary.healthScore} status={summary.healthLabel} />
      <div className="hidden h-6 w-px bg-border sm:block" />
      {stats.map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs">
          <Icon className={cn('h-3.5 w-3.5 text-muted-foreground', tone)} />
          <span className="text-muted-foreground">{label}:</span>
          <span className={cn('font-semibold', tone)}>{value}</span>
        </div>
      ))}
      {summary.lowStockCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-semibold">{summary.lowStockCount} low on stock</span>
        </div>
      )}
    </div>
  );
}
