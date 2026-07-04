import { formatCountdown } from '../../lib/format';
import { cn } from '../../lib/cn';

/** Quiet rate-lock / cancel-window countdown chip (§5A). Turns amber under a
 *  minute; expired state handled by the parent. */
export function CountdownChip({
  seconds,
  label = 'Rate held',
  className,
}: {
  seconds: number;
  label?: string;
  className?: string;
}) {
  const urgent = seconds <= 60 && seconds > 0;
  const expired = seconds <= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-12',
        expired
          ? 'border-border-subtle bg-sunken text-text-tertiary'
          : urgent
            ? 'border-border-subtle bg-warn-surface text-warn'
            : 'border-border-subtle bg-sunken text-text-secondary',
        className,
      )}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6.5" r="4.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 4.3v2.4l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {label} · <span className="money tabular">{formatCountdown(seconds)}</span>
    </span>
  );
}
