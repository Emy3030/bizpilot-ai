import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-48">
      {/* Ambient background — soft teal glow, not a hard gradient block */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] h-[400px] w-[400px] rounded-full bg-primary/[0.07] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Introducing your AI Chief Operating Officer
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Stop running your business.
            <br />
            <span className="text-primary">Start leading it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            BizPilot works alongside you as an AI Chief Operating Officer — monitoring operations, identifying
            risks, coordinating specialized agents, and executing approved work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/register">
                Start leading your business <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <a href="#mission-control">See Mission Control</a>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            No credit card required · Every action is approved by you before it happens
          </motion.p>
        </div>

        {/* Mission Control teaser panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mx-auto mt-20 max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
              </div>
              <span className="ml-2 text-xs font-medium text-muted-foreground">Mission Control · Live</span>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-3">
              <div className="bg-card p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-success" /> Today's revenue
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  ₦<AnimatedCounter value={482300} />
                </p>
                <p className="mt-1 text-xs text-success">▲ 18% vs yesterday</p>
              </div>
              <div className="bg-card p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <PackageCheck className="h-3.5 w-3.5 text-amber-500" /> Needs attention
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  <AnimatedCounter value={3} /> items
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Low stock, flagged overnight</p>
              </div>
              <div className="bg-card p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Awaiting your approval
                </div>
                <p className="font-display mt-2 text-2xl font-bold">
                  <AnimatedCounter value={2} /> actions
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Reviewed by your AI COO</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
