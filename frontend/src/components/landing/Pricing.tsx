import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

// Placeholder pricing — swap for real numbers before launch.
const PLANS = [
  {
    name: 'Starter',
    price: '₦0',
    period: '/month',
    description: 'For solo owners getting off spreadsheets.',
    features: ['Sales, inventory & expense tracking', 'Dashboard & basic reports', '1 AI Assistant conversation/day', 'Blockchain-verified receipts'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₦15,000',
    period: '/month',
    description: 'For businesses ready to hand off the busywork.',
    features: [
      'Everything in Starter',
      'Full AI Executive Team (all 8 agents)',
      'Unlimited AI conversations & actions',
      'Approval-gated automated workflows',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Executive',
    price: 'Custom',
    period: '',
    description: 'For multi-location businesses and teams.',
    features: ['Everything in Growth', 'Multiple staff accounts & role permissions', 'Dedicated onboarding', 'Custom integrations'],
    cta: 'Talk to us',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Pricing"
          title="Simple pricing, real value"
          subtitle="Start free. Upgrade when your AI team starts saving you more than it costs."
        />

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-7',
                plan.highlighted
                  ? 'border-primary bg-card shadow-xl shadow-primary/10 lg:-translate-y-3'
                  : 'border-border bg-card'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <p className="font-display mt-5 text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.highlighted ? 'default' : 'outline'} className="mt-7" asChild>
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
