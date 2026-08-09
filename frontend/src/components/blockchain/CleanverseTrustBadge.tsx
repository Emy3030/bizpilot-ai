import { ShieldCheck, ShieldQuestion, ShieldAlert } from 'lucide-react';
import { CleanverseTrustResult } from '@/types/sale';
import { cn } from '@/utils/cn';

const STATE_CONFIG = {
  CONNECTED: {
    icon: ShieldCheck,
    label: 'Cleanverse Verified',
    className: 'border-success/30 bg-success/10 text-success',
  },
  PENDING_CONFIGURATION: {
    icon: ShieldAlert,
    label: 'Cleanverse Pending Configuration',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  NOT_CONNECTED: {
    icon: ShieldQuestion,
    label: 'Cleanverse Not Connected',
    className: 'border-border bg-secondary text-muted-foreground',
  },
} as const;

/**
 * Never renders a "Verified" claim unless `trust.state === 'CONNECTED'`,
 * which only happens once a real Cleanverse response says so (see
 * cleanverseTrust.service.ts on the backend — there is no fabricated
 * "verified" path). Today this always shows NOT_CONNECTED honestly.
 */
export function CleanverseTrustBadge({ trust, compact = false }: { trust: CleanverseTrustResult; compact?: boolean }) {
  const config = STATE_CONFIG[trust.state];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-2 rounded-lg border p-3', config.className, compact && 'p-2')}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium">{config.label}</p>
        {!compact && <p className="mt-0.5 text-xs opacity-80">{trust.message}</p>}
      </div>
    </div>
  );
}
