import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  /** 'mount' animates as soon as the component renders (default — good for above-the-fold content).
   *  'viewport' animates the first time the section scrolls into view (good for long pages like Reports). */
  mode?: 'mount' | 'viewport';
  className?: string;
}

export function FadeInSection({ children, delay = 0, mode = 'mount', className }: FadeInSectionProps) {
  const viewportProps =
    mode === 'viewport' ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' } } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={mode === 'mount' ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={className}
      {...viewportProps}
    >
      {children}
    </motion.div>
  );
}
