import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionIntroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

/**
 * Shared "eyebrow + headline + subhead" block reused across every marketing
 * section (Metrics, AI Team, Workflow, Outcomes, Use Cases, Pricing, FAQ) so
 * the landing page reads as one designed system, not eight separately
 * hand-tuned headers.
 */
export function SectionIntro({ eyebrow, title, subtitle, align = 'center', className }: SectionIntroProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' ? 'text-center' : 'ml-0 text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-balance text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
