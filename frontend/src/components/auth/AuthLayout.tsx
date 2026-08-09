import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Sun, Moon, Sparkles, ShieldCheck, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const VALUE_PROPS = [
  { icon: Sparkles, text: 'An AI executive team that watches your business 24/7' },
  { icon: ShieldCheck, text: 'Every action is approved by you before it happens' },
  { icon: Users2, text: 'Built for the way small businesses actually run' },
];

/** Shared split-screen shell for Login/Register — branding panel on the
 *  left (desktop only), the form itself on the right. Keeps both auth
 *  pages visually identical without duplicating the branding markup. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/95 to-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">BizPilot</span>
        </Link>

        <div className="relative">
          <h2 className="font-display text-balance text-4xl font-bold leading-tight tracking-tight">
            Your AI Chief Operating Officer is ready to get to work.
          </h2>
          <div className="mt-8 space-y-4">
            {VALUE_PROPS.map((prop, i) => (
              <motion.div
                key={prop.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <prop.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-primary-foreground/90">{prop.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">BizPilot — your AI Chief Operating Officer.</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 lg:justify-end">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Rocket className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold tracking-tight">BizPilot</span>
          </Link>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
