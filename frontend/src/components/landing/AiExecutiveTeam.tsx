import {
  Crown,
  LineChart,
  ShoppingCart,
  Boxes,
  Megaphone,
  HeartHandshake,
  Workflow,
  FileCheck2,
} from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

const AGENTS = [
  {
    icon: Crown,
    name: 'COO Agent',
    role: 'Chief Operating Officer',
    description: 'Coordinates every other agent, sets priorities, and briefs you each morning on what matters.',
  },
  {
    icon: LineChart,
    name: 'Finance Agent',
    role: 'Cash flow & profit',
    description: 'Tracks revenue, margins, and expenses — flags anything that would hurt cash flow before it does.',
  },
  {
    icon: ShoppingCart,
    name: 'Sales Agent',
    role: 'Revenue & pipeline',
    description: 'Spots slowing sales trends, surfaces your best customers, and drafts follow-ups worth sending.',
  },
  {
    icon: Boxes,
    name: 'Inventory Agent',
    role: 'Stock & supply',
    description: 'Predicts stockouts before they happen and recommends what to restock, and when.',
  },
  {
    icon: Megaphone,
    name: 'Marketing Agent',
    role: 'Campaigns & offers',
    description: 'Writes ready-to-send promotions and discount campaigns grounded in your real sales data.',
  },
  {
    icon: HeartHandshake,
    name: 'Customer Success Agent',
    role: 'Retention & risk',
    description: 'Watches for customers going quiet or debt building up, and tells you who to check in with.',
  },
  {
    icon: Workflow,
    name: 'Operations Agent',
    role: 'Day-to-day execution',
    description: 'Handles the repetitive work — recording sales, logging expenses — so you can focus elsewhere.',
  },
  {
    icon: FileCheck2,
    name: 'Document Agent',
    role: 'Invoices & trust',
    description: 'Generates invoices and receipts, and anchors them on-chain so every record is tamper-proof.',
  },
];

export function AiExecutiveTeam() {
  return (
    <section id="ai-team" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Your team"
          title="Meet your AI Executive Team"
          subtitle="Eight specialists, one mission: run the parts of your business that don't need you in the room — and hand you exactly what does."
        />

        <StaggerContainer className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((agent) => (
            <StaggerItem key={agent.name}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <agent.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-4 text-base font-semibold">{agent.name}</h3>
                <p className="mt-0.5 text-xs font-medium text-primary">{agent.role}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
