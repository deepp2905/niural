import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn';

/** Crossfades a formatted number when it changes — the 200ms settlement morph
 *  on the fee-bearer toggle (§5B). No slot-machine gimmick, just a quiet swap.
 *  Framer respects prefers-reduced-motion automatically. */
export function MorphNumber({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn('relative inline-block', className)}>
      {/* Invisible spacer keeps layout stable while the value crossfades. */}
      <span className="invisible">{value}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
