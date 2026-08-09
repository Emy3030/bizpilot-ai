import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, Bot } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { FadeInSection } from '@/components/motion/FadeInSection';

export function MissionControlPreview() {
  return (
    <section id="mission-control" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Your command center"
          title="Mission Control: everything, at a glance"
          subtitle="Log in and know, in ten seconds, what happened, what changed, what needs you, and what your AI team already handled."
        />

        <FadeInSection mode="viewport" delay={0.1} className="relative mx-auto mt-16 max-w-5xl">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-[120%] bg-primary/[0.05] blur-3xl" />

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
            {/* Morning briefing header */}
            <div className="flex flex-col gap-3 border-b border-border bg-gradient-to-br from-primary/[0.06] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold">Good morning — here's your briefing</p>
                  <p className="text-xs text-muted-foreground">Your AI COO reviewed the last 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Business Health: Strong
              </div>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-[1.4fr_1fr]">
              {/* Left: activity + recommendations */}
              <div className="space-y-3 bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Today's priorities
                </p>

                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">3 products will stock out this week</p>
                    <p className="text-xs text-muted-foreground">Inventory Agent recommends restocking today</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">4 customers owe over 30 days</p>
                    <p className="text-xs text-muted-foreground">Customer Success Agent drafted follow-up messages</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <div>
                    <p className="text-sm font-medium">Already handled overnight</p>
                    <p className="text-xs text-muted-foreground">
                      2 invoices generated, anchored on-chain, and sent
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: approvals queue */}
              <div className="bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Awaiting your approval
                </p>
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: 'Restock 40 units — Peak Milk', tag: 'Inventory' },
                    { label: 'Send discount campaign to 12 dormant customers', tag: 'Marketing' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-medium text-muted-foreground">{item.tag}</p>
                      <p className="mt-1 text-sm">{item.label}</p>
                      <div className="mt-2.5 flex gap-2">
                        <span className="flex-1 rounded-lg bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground">
                          Approve
                        </span>
                        <span className="flex-1 rounded-lg border border-border py-1.5 text-center text-xs font-medium text-muted-foreground">
                          Review
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"
          >
            An illustrative preview of Mission Control <ArrowUpRight className="h-3 w-3" />
          </motion.p>
        </FadeInSection>
      </div>
    </section>
  );
}
