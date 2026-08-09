import { Store, UtensilsCrossed, Pill, Scissors, Truck, Smartphone } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

const INDUSTRIES = [
  { icon: Store, name: 'Retail & shops', description: 'Stock, pricing, and daily sales, watched automatically.' },
  { icon: UtensilsCrossed, name: 'Restaurants & food', description: 'Ingredient stock and daily takings, tracked in real time.' },
  { icon: Pill, name: 'Pharmacies', description: 'Never run out of what customers need most.' },
  { icon: Scissors, name: 'Salons & services', description: 'Track repeat customers and what keeps them coming back.' },
  { icon: Truck, name: 'Wholesale & distribution', description: 'Credit, debt, and bulk orders, all in one ledger.' },
  { icon: Smartphone, name: 'Electronics & gadgets', description: 'Serialized inventory with tamper-proof warranty records.' },
];

export function IndustryUseCases() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Built for your business"
          title="Wherever you sell, it fits"
          subtitle="BizPilot adapts to how your business actually runs — not the other way around."
        />

        <StaggerContainer className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((industry) => (
            <StaggerItem key={industry.name}>
              <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <industry.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{industry.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{industry.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
