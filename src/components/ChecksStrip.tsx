import { useState } from 'react';
import type { CheckItem } from '../lib/review';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

const ICON: Record<CheckItem['status'], { glyph: string; color: string }> = {
  verified: { glyph: '✓', color: 'text-success' },
  warn: { glyph: '⚠', color: 'text-warn' },
  blocked: { glyph: '⛔', color: 'text-danger' },
};

/** Row of quiet, expandable check items (§5D). Trust is inspectable — each
 *  item opens to show its evidence. Blocked items expose a resolving action. */
export function ChecksStrip({
  checks,
  onRequestRenewal,
}: {
  checks: CheckItem[];
  onRequestRenewal?: () => void;
}) {
  return (
    <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-raised">
      {checks.map((check) => (
        <CheckRow key={check.id} check={check} onRequestRenewal={onRequestRenewal} />
      ))}
    </div>
  );
}

function CheckRow({
  check,
  onRequestRenewal,
}: {
  check: CheckItem;
  onRequestRenewal?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const icon = ICON[check.status];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-sunken"
      >
        <span className={cn('shrink-0 text-13', icon.color)} aria-hidden>
          {icon.glyph}
        </span>
        <span
          className={cn(
            'flex-1 text-13',
            check.status === 'blocked' ? 'font-500 text-text-primary' : 'text-text-primary',
          )}
        >
          {check.label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={cn('shrink-0 text-text-tertiary transition-transform', open && 'rotate-180')}
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-3 pl-11 text-12 text-text-secondary">
          <p>{check.detail}</p>
          {check.status === 'blocked' && check.id === 'tax' && onRequestRenewal && (
            <Button size="sm" className="mt-2.5" onClick={onRequestRenewal}>
              Request renewal — sends the form in-app
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
