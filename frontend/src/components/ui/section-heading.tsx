import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Standardizes the "title + description (+ optional action button)" header
 * used at the top of every list page (Customers, Inventory, Sales, Expenses,
 * Reports). Existing inline headers can be migrated to this incrementally —
 * it's a drop-in visual match for the current markup, just centralized.
 */
export function SectionHeading({ title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
