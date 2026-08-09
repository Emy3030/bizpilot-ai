import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeInSection } from '@/components/motion/FadeInSection';

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection mode="viewport">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]" />
            <h2 className="font-display relative text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Your business doesn't need more software.
              <br />
              It needs a team.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
              Set up in minutes. Your AI Executive Team starts watching the moment you add your first sale.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/register">
                  Start leading your business <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
