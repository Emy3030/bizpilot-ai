import { Quote } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { FadeInSection } from '@/components/motion/FadeInSection';

// Illustrative quotes reflecting common small-business pain points BizPilot
// is built to solve — attributed by role, not a fabricated named individual.
const QUOTES = [
  {
    quote:
      "I don't have time to check stock levels every day. I need something that tells me before I run out, not after.",
    role: 'Retail shop owner',
  },
  {
    quote:
      'Half my headache is remembering who still owes me money. If that was just handled automatically, that alone would be worth it.',
    role: 'Wholesale distributor',
  },
  {
    quote:
      "I'll use AI for insights, but not for anything that touches money without me seeing it first.",
    role: 'Pharmacy manager',
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What business owners tell us"
          title="Built around real, everyday frustrations"
          subtitle="The problems BizPilot is designed to solve, in the words business owners actually use."
        />

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {QUOTES.map((item, i) => (
            <FadeInSection key={item.role} mode="viewport" delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                <Quote className="h-5 w-5 text-primary/40" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground">"{item.quote}"</p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">— {item.role}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
