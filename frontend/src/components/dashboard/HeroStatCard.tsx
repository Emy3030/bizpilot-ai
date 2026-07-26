import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';

interface HeroStatCardProps {
  label: string;
  numericValue: number;
  formatValue: (n: number) => string;
  icon: LucideIcon;
  subtext?: string;
}

/**
 * The dashboard's primary metric gets visual priority instead of sitting in
 * a row of four identical cards — larger type, a filled brand-color surface,
 * and its own bento cell (col-span-2 on the dashboard grid). Pairs with the
 * regular StatCard for the secondary metrics alongside it.
 */
export function HeroStatCard({ label, numericValue, formatValue, icon: Icon, subtext }: HeroStatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-white/5" />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-primary-foreground/80">{label}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            <AnimatedCounter value={numericValue} format={formatValue} />
          </p>
          {subtext && <p className="mt-2 text-xs text-primary-foreground/70">{subtext}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
