import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
  /** Optional: when provided alongside `formatValue`, the number animates
   *  (counts up/down) on change instead of just showing `value` statically.
   *  `value` is still required as the accessible/initial-render fallback. */
  numericValue?: number;
  formatValue?: (n: number) => string;
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  destructive: 'bg-destructive/10 text-destructive',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
  delay = 0,
  numericValue,
  formatValue,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">
              {numericValue !== undefined && formatValue ? (
                <AnimatedCounter value={numericValue} format={formatValue} />
              ) : (
                value
              )}
            </p>
            {trend && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  trend.positive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accentClasses[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
