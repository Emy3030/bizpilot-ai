import { Eye, Brain, ClipboardCheck, Zap } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { FadeInSection } from '@/components/motion/FadeInSection';

const STEPS = [
  {
    icon: Eye,
    title: 'It watches',
    description: 'Every sale, expense, low-stock alert, and overdue payment flows into one place, continuously.',
  },
  {
    icon: Brain,
    title: 'It analyzes',
    description: 'Your AI team reasons over the data like an executive would — spotting risks and opportunities.',
  },
  {
    icon: ClipboardCheck,
    title: 'It recommends',
    description: 'You get a clear brief: what happened, what it means, and exactly what it wants to do about it.',
  },
  {
    icon: Zap,
    title: 'You approve, it executes',
    description: 'One tap and it\'s done — restocked, invoiced, followed up. Nothing happens without your say-so.',
  },
];

export function BusinessWorkflow() {
  return (
    <section id="workflow" className="bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="How it works"
          title="From raw data to a decision, in one loop"
          subtitle="Not a dashboard you have to interpret yourself. A team that interprets it for you, and waits for your go-ahead."
        />

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block" />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
            {STEPS.map((step, i) => (
              <FadeInSection key={step.title} mode="viewport" delay={i * 0.08} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-sm">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
