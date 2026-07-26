import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/**
 * Wraps a set of StaggerItem children so they animate in one after another
 * instead of all at once. Use for grids/lists of cards (stat cards, tables of
 * results, etc). Each direct child should be a <StaggerItem>.
 */
export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
