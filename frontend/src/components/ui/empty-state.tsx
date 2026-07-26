import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

/**
 * Standardizes empty states across the app. Every table/list component
 * (CustomerTable, ProductTable, SalesTable, ExpenseTable, RecentTransactions,
 * LowStockList, etc.) currently hand-rolls its own version of this — this
 * component is a drop-in replacement for that repeated markup.
 */
export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-center ${compact ? 'py-8' : 'py-16'}`}>
      <Icon className="h-8 w-8 text-muted-foreground opacity-40" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
