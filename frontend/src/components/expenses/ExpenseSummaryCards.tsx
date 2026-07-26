import { CalendarDays, CalendarRange, Wallet } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ExpenseSummary } from '@/types/expense';
import { formatCurrency } from '@/utils/formatCurrency';

export function ExpenseSummaryCards({ summary, currency }: { summary: ExpenseSummary; currency: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Today's expenses"
        value={formatCurrency(summary.today.total, currency)}
        icon={Wallet}
        accent="destructive"
      />
      <StatCard
        label="This week"
        value={formatCurrency(summary.thisWeek.total, currency)}
        icon={CalendarDays}
        accent="warning"
        delay={0.05}
      />
      <StatCard
        label="This month"
        value={formatCurrency(summary.thisMonth.total, currency)}
        icon={CalendarRange}
        accent="primary"
        delay={0.1}
      />
    </div>
  );
}
