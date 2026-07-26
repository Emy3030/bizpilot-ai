import { motion } from 'framer-motion';

const dotTransition = (delay: number) => ({
  duration: 0.6,
  repeat: Infinity,
  repeatType: 'loop' as const,
  delay,
  ease: 'easeInOut' as const,
});

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl bg-secondary px-4 py-3">
      {[0, 0.15, 0.3].map((delay) => (
        <motion.span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ y: [0, -4, 0] }}
          transition={dotTransition(delay)}
        />
      ))}
    </div>
  );
}
