import type { PayoutStatus } from '../../lib/types';
import { cn } from '../../lib/cn';

interface ChipStyle {
  label: string;
  className: string;
  dot: string;
}

const STATUS: Record<PayoutStatus, ChipStyle> = {
  draft: { label: 'Draft', className: 'bg-sunken text-text-secondary', dot: 'bg-text-tertiary' },
  'needs-review': {
    label: 'Needs review',
    className: 'bg-warn-surface text-warn',
    dot: 'bg-warn',
  },
  scheduled: { label: 'Scheduled', className: 'bg-info-surface text-info', dot: 'bg-info' },
  processing: { label: 'Processing', className: 'bg-info-surface text-info', dot: 'bg-info' },
  paid: { label: 'Paid', className: 'bg-success-surface text-success', dot: 'bg-success' },
  failed: { label: 'Failed', className: 'bg-danger-surface text-danger', dot: 'bg-danger' },
  held: { label: 'Held', className: 'bg-warn-surface text-warn', dot: 'bg-warn' },
};

export function StatusChip({
  status,
  className,
  pulse,
}: {
  status: PayoutStatus;
  className?: string;
  /** Animate the dot for in-flight states (processing). */
  pulse?: boolean;
}) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-12 font-500',
        s.className,
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          s.dot,
          pulse && (status === 'processing' ? 'animate-pulse' : ''),
        )}
        aria-hidden
      />
      {s.label}
    </span>
  );
}
