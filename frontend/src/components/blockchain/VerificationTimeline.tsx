import { motion } from 'framer-motion';
import { FileCheck2, Link2, ShieldCheck, Loader2, X } from 'lucide-react';
import { ChainStatus } from '@/types/sale';
import { cn } from '@/utils/cn';

interface Step {
  icon: typeof FileCheck2;
  label: string;
  state: 'done' | 'pending' | 'failed';
}

export function VerificationTimeline({ chainStatus, issuedAt }: { chainStatus: ChainStatus; issuedAt: string }) {
  const steps: Step[] = [
    {
      icon: FileCheck2,
      label: `Document created — ${new Date(issuedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
      state: 'done',
    },
    {
      icon: Link2,
      label:
        chainStatus === 'CONFIRMED'
          ? 'Hash anchored on Base Sepolia'
          : chainStatus === 'FAILED'
            ? 'Anchoring failed — hash stored locally'
            : 'Anchoring in progress',
      state: chainStatus === 'CONFIRMED' ? 'done' : chainStatus === 'FAILED' ? 'failed' : 'pending',
    },
    {
      icon: ShieldCheck,
      label: 'Verified right now, by you',
      state: 'done',
    },
  ];

  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.3 }}
          className="relative flex items-start gap-3 pb-5 last:pb-0"
        >
          {i < steps.length - 1 && <div className="absolute left-[15px] top-8 h-full w-px bg-border" />}
          <div
            className={cn(
              'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              step.state === 'done' && 'bg-success/15 text-success',
              step.state === 'pending' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              step.state === 'failed' && 'bg-destructive/15 text-destructive'
            )}
          >
            {step.state === 'pending' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step.state === 'failed' ? (
              <X className="h-4 w-4" />
            ) : (
              <step.icon className="h-4 w-4" />
            )}
          </div>
          <p className="mt-1.5 text-sm text-foreground/90">{step.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
