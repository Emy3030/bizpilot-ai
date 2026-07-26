import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Wraps a page's content in a subtle fade + rise on mount.
 * Use once per page, around the top-level content — not per-component.
 *
 * Usage:
 *   <AppLayout>
 *     <PageTransition>
 *       ...page content...
 *     </PageTransition>
 *   </AppLayout>
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
