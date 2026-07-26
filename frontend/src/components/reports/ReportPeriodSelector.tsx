import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { ReportPeriod } from '@/types/report';

const PERIODS: { label: string; value: ReportPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

interface Props {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  rangeLabel: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}

export function ReportPeriodSelector({ period, onPeriodChange, rangeLabel, onPrev, onNext, nextDisabled }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex rounded-lg border border-border p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              period === p.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[160px] text-center text-sm font-medium">{rangeLabel}</span>
        <Button variant="outline" size="icon" onClick={onNext} disabled={nextDisabled}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
