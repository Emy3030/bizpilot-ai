import { Clock, TrendingUp, ShieldCheck, Users2 } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

const OUTCOMES = [
  {
    icon: Clock,
    title: 'Hours back, every week',
    description:
      'Stop manually checking stock levels, chasing debts, and building reports by hand. Your team surfaces what matters before you ask.',
  },
  {
    icon: TrendingUp,
    title: 'Fewer missed opportunities',
    description:
      'Catch a stockout before it costs you a sale, and a slow-moving product before it costs you shelf space.',
  },
  {
    icon: ShieldCheck,
    title: 'Records nobody can dispute',
    description:
      'Every invoice and receipt is hashed and anchored on-chain — verifiable by anyone, in seconds, with no login required.',
  },
  {
    icon: Users2,
    title: 'Customers who don\'t fall through the cracks',
    description:
      'Outstanding debt, quiet customers, and follow-ups worth sending — flagged automatically, not remembered by accident.',
  },
];

export function ExecutiveOutcomes() {
  return (
    <section className="border-y border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Why it matters"
          title="Built for outcomes, not dashboards"
          subtitle="Every screen exists to answer one question: what should you actually do next?"
        />

        <StaggerContainer className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
          {OUTCOMES.map((outcome) => (
            <StaggerItem key={outcome.title}>
              <div className="flex h-full gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <outcome.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">{outcome.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{outcome.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
