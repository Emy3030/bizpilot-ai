import { HealthLabel } from '@/types/dashboard';
import { cn } from '@/utils/cn';

const HEALTH_STYLES: Record<HealthLabel, string> = {
  Strong: 'border-success/30 bg-success/10 text-success',
  Steady: 'border-primary/30 bg-primary/10 text-primary',
  'Needs attention': 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'At risk': 'border-destructive/30 bg-destructive/10 text-destructive',
};

const HEALTH_TEXT_STYLES: Record<HealthLabel, string> = {
  Strong: 'text-success',
  Steady: 'text-primary',
  'Needs attention': 'text-amber-600 dark:text-amber-400',
  'At risk': 'text-destructive',
};

interface HealthScorePillProps {
  label: string;
  score: number;
  status: HealthLabel;
  className?: string;
  /** True when there isn't enough real activity (e.g. zero sales ever) for
   *  the score to mean anything yet. A brand-new account scores "100
   *  Strong" by the deduction-based math below purely because nothing has
   *  gone wrong — which looks identical to an actually healthy business.
   *  This renders a neutral "not enough data" state instead of the number,
   *  so the pill never implies a confidence the product doesn't have. */
  insufficientData?: boolean;
}

/** Compact "Business Health: Strong (92)" pill — used inline, e.g. in the
 *  Morning Briefing header. For a labeled grid of multiple scores (Revenue,
 *  Cash Flow, Operations, ...), see HealthScoreCard below. */
export function HealthScorePill({ label, score, status, className, insufficientData }: HealthScorePillProps) {
  if (insufficientData) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        {label}: Not enough data yet
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
        HEALTH_STYLES[status],
        className
      )}
    >
      {label}: {status} ({score})
    </div>
  );
}

interface HealthScoreCardProps {
  label: string;
  score: number;
  status: HealthLabel;
}

/** One tile in a multi-metric health grid (Revenue / Cash Flow / Operations /
 *  Customers / Inventory) — a labeled score with a proportional bar. */
export function HealthScoreCard({ label, score, status }: HealthScoreCardProps) {
  const barColor =
    status === 'Strong'
      ? 'bg-success'
      : status === 'Steady'
        ? 'bg-primary'
        : status === 'Needs attention'
          ? 'bg-amber-500'
          : 'bg-destructive';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-display text-sm font-semibold">{score}</p>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
      <p className={cn('mt-1.5 text-xs font-medium', HEALTH_TEXT_STYLES[status])}>{status}</p>
    </div>
  );
}
