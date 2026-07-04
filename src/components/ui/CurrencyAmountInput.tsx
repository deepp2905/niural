import { useEffect, useState } from 'react';
import type { CurrencyCode } from '../../lib/types';
import { formatMoney, formatRate } from '../../lib/format';
import type { AmountAnomaly, GhostPrior } from '../../lib/anomaly';
import { AlertTriangleIcon } from './Icon';
import { cn } from '../../lib/cn';

interface Props {
  amountUsd: number | null;
  onChange: (amountUsd: number | null) => void;
  receiveCurrency: CurrencyCode;
  rate: number;
  ghost?: GhostPrior | null;
  onAcceptGhost?: () => void;
  anomaly?: AmountAnomaly | null;
  id?: string;
  autoFocus?: boolean;
}

/** The one bespoke input (§8d.2): USD send paired with a live-converted receive
 *  field, a ghost-prior suggestion, and an inline anomaly flag. */
export function CurrencyAmountInput({
  amountUsd,
  onChange,
  receiveCurrency,
  rate,
  ghost,
  onAcceptGhost,
  anomaly,
  id,
  autoFocus,
}: Props) {
  const [text, setText] = useState(amountUsd != null ? String(amountUsd) : '');

  // Keep local text in sync when the amount is set externally (ghost accept).
  useEffect(() => {
    setText(amountUsd != null ? String(amountUsd) : '');
  }, [amountUsd]);

  const empty = text.trim() === '';
  const showGhost = empty && !!ghost;
  const receiveAmount = amountUsd != null ? amountUsd * rate : ghost ? ghost.amountUsd * rate : 0;

  const commit = (raw: string) => {
    setText(raw);
    const cleaned = raw.replace(/[^0-9.]/g, '');
    if (cleaned === '') return onChange(null);
    const n = Number(cleaned);
    onChange(Number.isFinite(n) ? n : null);
  };

  const acceptGhost = () => {
    if (ghost) {
      onChange(ghost.amountUsd);
      onAcceptGhost?.();
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        {/* Send */}
        <div>
          <p className="mb-1 text-12 text-text-tertiary">You send</p>
          <div
            className={cn(
              'flex h-11 items-center gap-2 rounded-md border bg-raised px-3',
              anomaly ? 'border-l-2 border-l-warn border-border-subtle' : 'border-border-subtle',
              'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]',
            )}
          >
            <span className="money shrink-0 text-16 text-text-tertiary">$</span>
            <input
              id={id}
              autoFocus={autoFocus}
              inputMode="decimal"
              value={showGhost ? '' : text}
              placeholder={showGhost ? String(ghost!.amountUsd) : '0.00'}
              onChange={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && showGhost) {
                  e.preventDefault();
                  acceptGhost();
                }
              }}
              className={cn(
                'money h-full w-full bg-transparent text-16 text-text-money outline-none',
                showGhost ? 'placeholder:text-text-tertiary placeholder:italic' : 'placeholder:text-text-tertiary',
              )}
            />
            <span className="shrink-0 text-12 font-500 text-text-tertiary">USD</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden items-end pb-3.5 sm:flex" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-text-tertiary">
            <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Receive (read-only) */}
        <div>
          <p className="mb-1 text-12 text-text-tertiary">Recipient gets</p>
          <div className="flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-sunken px-3">
            <span className="money w-full truncate text-16 text-text-money">
              {formatMoney(receiveAmount, receiveCurrency, { decimals: receiveCurrency === 'USDC' ? 2 : 0 })}
            </span>
            <span className="shrink-0 text-12 font-500 text-text-tertiary">{receiveCurrency}</span>
          </div>
        </div>
      </div>

      {/* Live conversion line */}
      <p className="money text-12 text-text-tertiary">
        1 USD = {formatRate(rate)} {receiveCurrency} · mid-market rate, no spread
      </p>

      {/* Ghost-prior accept affordance */}
      {showGhost && (
        <button
          type="button"
          onClick={acceptGhost}
          className="flex items-center gap-1.5 text-12 text-text-secondary hover:text-text-primary"
        >
          <span className="rounded border border-border-strong px-1 py-0.5 text-[10px] font-600 text-text-tertiary">Tab</span>
          {ghost!.label}
        </button>
      )}

      {/* Anomaly flag (non-blocking, persists to review) */}
      {anomaly && (
        <p className="flex items-start gap-1.5 rounded-md bg-warn-surface px-2.5 py-1.5 text-12 text-text-primary">
          <AlertTriangleIcon size={14} className="mt-[1px] shrink-0 text-warn" />
          <span>{anomaly.message}</span>
        </p>
      )}
    </div>
  );
}
