import { FadeInSection } from '@/components/motion/FadeInSection';

const METRICS = [
  { value: '24/7', label: 'Monitoring your operations' },
  { value: '8', label: 'Specialized AI agents on your team' },
  { value: '100%', label: 'Actions require your approval' },
  { value: '<2 min', label: 'From alert to decision' },
];

export function ExecutiveMetrics() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {METRICS.map((metric, i) => (
            <FadeInSection key={metric.label} mode="viewport" delay={i * 0.06} className="text-center">
              <p className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {metric.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{metric.label}</p>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
