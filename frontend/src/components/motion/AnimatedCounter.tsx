import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  /** Formats the in-progress number for display each frame, e.g. currency or compact notation. */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/**
 * Animates a number counting up (or down) to `value` whenever it changes.
 * Re-runs from the previous displayed value, so live-refetched dashboard
 * numbers animate smoothly instead of jumping.
 */
export function AnimatedCounter({ value, format, duration = 0.8, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => {
        previousValue.current = value;
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display).toLocaleString()}</span>;
}
