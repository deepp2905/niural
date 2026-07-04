import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface Segment<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

/** Two-plus option segmented control (fee-bearer toggle, method selector). */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
  className,
  size = 'md',
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  segments: Segment<T>[];
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-md border border-border-subtle bg-sunken p-0.5',
        className,
      )}
    >
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={seg.disabled}
            onClick={() => onChange(seg.value)}
            className={cn(
              'rounded-[5px] font-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              size === 'sm' ? 'px-2.5 py-1 text-12' : 'px-3 py-1.5 text-13',
              active
                ? 'bg-raised text-text-primary shadow-raised'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
