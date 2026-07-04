import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SparkGlyph } from './AIChip';

/** Left-accent treatment. `warn` = medium-confidence AI match (§4b). */
export type InputAccent = 'none' | 'ai' | 'warn' | 'danger';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  accent?: InputAccent;
  /** Rendered inside the field on the right (AIChip / edited marker). */
  suffix?: ReactNode;
  /** Non-interactive leading adornment (currency symbol, search glyph). */
  leading?: ReactNode;
  /** Placeholder-weight styling for AI ghost suggestions. */
  ghost?: boolean;
  inputClassName?: string;
}

const ACCENT: Record<InputAccent, string> = {
  none: 'border-border-subtle focus-within:border-border-strong',
  ai: 'border-border-subtle border-l-2 border-l-ai focus-within:border-border-strong',
  warn: 'border-border-subtle border-l-2 border-l-warn focus-within:border-border-strong',
  danger: 'border-danger focus-within:border-danger',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { accent = 'none', suffix, leading, ghost, className, inputClassName, disabled, ...props },
  ref,
) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border bg-raised px-3 transition-colors',
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]',
        ACCENT[accent],
        disabled && 'cursor-not-allowed bg-sunken opacity-60',
        className,
      )}
    >
      {leading && <span className="shrink-0 text-13 text-text-tertiary">{leading}</span>}
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          'h-9 w-full bg-transparent text-13 text-text-primary outline-none placeholder:text-text-tertiary',
          ghost && 'italic text-text-tertiary',
          inputClassName,
        )}
        {...props}
      />
      {suffix && <span className="flex shrink-0 items-center">{suffix}</span>}
    </div>
  );
});

/** "Edited" marker that replaces the AI chip once a user changes a field (§4b). */
export function EditedMarker({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-sunken px-1.5 py-0.5 text-[10px] font-500 uppercase tracking-wide text-text-tertiary',
        className,
      )}
      title="You edited this — provenance cleared"
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path
          d="M8.5 1.5 10.5 3.5 4 10l-3 1 1-3 6.5-6.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      edited
    </span>
  );
}

/** Field wrapper: label + control + evidence/hint/error line (§4a rhythm). */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  evidence,
  children,
  className,
  labelSuffix,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Amber inline evidence line for medium-confidence matches (§4b). */
  evidence?: ReactNode;
  children: ReactNode;
  className?: string;
  labelSuffix?: ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={htmlFor} className="text-13 font-500 text-text-primary">
            {label}
          </label>
          {labelSuffix}
        </div>
      )}
      {children}
      {evidence && (
        <p className="flex items-start gap-1.5 text-12 text-warn">
          <SparkGlyph className="mt-[3px] shrink-0 text-ai" />
          <span className="text-text-secondary">{evidence}</span>
        </p>
      )}
      {error && <p className="text-12 text-danger">{error}</p>}
      {hint && !error && <p className="text-12 text-text-tertiary">{hint}</p>}
    </div>
  );
}
