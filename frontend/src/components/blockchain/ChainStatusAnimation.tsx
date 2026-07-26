import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, X, Link2 } from 'lucide-react';
import { ChainStatus } from '@/types/sale';
import { cn } from '@/utils/cn';

interface ChainStatusAnimationProps {
  status: ChainStatus;
  txHash?: string | null;
  compact?: boolean;
}

const STATUS_CONFIG: Record<ChainStatus, { label: string; description: string }> = {
  PENDING: { label: 'Pending', description: 'Waiting to be anchored on Base Sepolia' },
  CONFIRMED: { label: 'Confirmed', description: 'Anchored on-chain and verifiable' },
  FAILED: { label: 'Failed', description: 'Anchoring failed — hash is still stored locally' },
};

function StatusIcon({ status }: { status: ChainStatus }) {
  if (status === 'CONFIRMED') {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <Check className="h-4 w-4" />
      </motion.div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <X className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}

/**
 * Visualizes an invoice/receipt's on-chain anchoring status. Purely
 * presentational — reads whatever `chainStatus`/`txHash` the backend already
 * returns (see blockchain.service.ts). No polling: PENDING/FAILED are static
 * until the record is refetched, since anchoring happens synchronously
 * during invoice/receipt generation.
 */
export function ChainStatusAnimation({ status, txHash, compact = false }: ChainStatusAnimationProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-border p-3', compact && 'p-2')}>
      <AnimatePresence mode="wait">
        <motion.div key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <StatusIcon status={status} />
        </motion.div>
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{config.label}</p>
        {!compact && <p className="truncate text-xs text-muted-foreground">{config.description}</p>}
      </div>

      {txHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Link2 className="h-3 w-3" />
          View tx
        </a>
      )}
    </div>
  );
}
