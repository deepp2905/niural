import type { ReactNode } from 'react';
import { Popover } from './Popover';
import { cn } from '../../lib/cn';

/** The AI presence mark. Violet, small, and the ONLY place the literal word
 *  "AI" appears in the product (§8a, §12). Click opens provenance. */
export function AIChip({
  label = 'AI',
  provenance,
  className,
  confidence,
}: {
  label?: string;
  /** Provenance copy shown on click ("why did AI do this"). */
  provenance: ReactNode;
  className?: string;
  confidence?: 'high' | 'medium' | 'low';
}) {
  const chip = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-ai-border bg-ai-surface px-1.5 py-0.5 text-[10px] font-600 uppercase tracking-wide text-ai',
        'transition-colors hover:border-ai focus-visible:outline-none',
        className,
      )}
      aria-label="Why the agent filled this — view provenance"
    >
      <span className="grid h-2.5 w-2.5 place-items-center" aria-hidden>
        <SparkGlyph />
      </span>
      {label}
    </button>
  );

  return (
    <Popover trigger={chip} align="end">
      <ProvenanceBody confidence={confidence}>{provenance}</ProvenanceBody>
    </Popover>
  );
}

export function ProvenanceBody({
  confidence,
  children,
}: {
  confidence?: 'high' | 'medium' | 'low';
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-12 font-600 text-ai">
        <SparkGlyph />
        Agent provenance
        {confidence && (
          <span className="ml-auto rounded bg-ai-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ai">
            {confidence} confidence
          </span>
        )}
      </div>
      <div className="text-13 leading-relaxed text-text-secondary">{children}</div>
    </div>
  );
}

/** The violet agent glyph — a small four-point spark. */
export function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path
        d="M6 0.5c.3 2.6 2.9 5.2 5.5 5.5-2.6.3-5.2 2.9-5.5 5.5-.3-2.6-2.9-5.2-5.5-5.5C3.1 5.7 5.7 3.1 6 .5Z"
        fill="currentColor"
      />
    </svg>
  );
}
