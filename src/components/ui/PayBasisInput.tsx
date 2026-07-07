import { useState } from 'react';
import type { CurrencyCode, PayBasis } from '../../lib/types';
import { formatMoney, formatRate } from '../../lib/format';
import { usdFromLocal, payBasisLocalTotal } from '../../lib/settlement';
import type { AmountAnomaly } from '../../lib/anomaly';
import { AlertTriangleIcon } from './Icon';
import { SegmentedControl } from './SegmentedControl';
import { cn } from '../../lib/cn';

export interface PayBasisResult {
  basis: PayBasis;
  /** Total in the contractor's currency (fixed sum, or rate × hours). */
  localTotal: number;
  /** Derived USD the sender pays — the figure the settlement engine consumes. */
  amountUsd: number;
}

interface Props {
  receiveCurrency: CurrencyCode;
  /** Mid-market USD→local rate; USD is derived as localTotal ÷ rate. */
  rate: number;
  onChange: (result: PayBasisResult | null) => void;
  anomaly?: AmountAnomaly | null;
  id?: string;
  autoFocus?: boolean;
}

type Mode = PayBasis['mode'];

function toNumber(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Local-currency-first amount entry (§ local-currency entry). The contractor is
 * paid a fixed sum or an hourly rate × hours in their own currency; the USD the
 * sender pays is derived live. Replaces the USD-first CurrencyAmountInput in the
 * manual create flow so the number the operator types is the number that lands.
 */
export function PayBasisInput({
  receiveCurrency,
  rate,
  onChange,
  anomaly,
  id,
  autoFocus,
}: Props) {
  const [mode, setMode] = useState<Mode>('fixed');
  const [fixedText, setFixedText] = useState('');
  const [rateText, setRateText] = useState('');
  const [hoursText, setHoursText] = useState('');

  const localTotal =
    mode === 'fixed'
      ? toNumber(fixedText)
      : toNumber(rateText) * toNumber(hoursText);
  const amountUsd = usdFromLocal(localTotal, rate);

  const emit = (next: { mode: Mode; fixed: string; rate: string; hours: string }) => {
    const total =
      next.mode === 'fixed'
        ? toNumber(next.fixed)
        : toNumber(next.rate) * toNumber(next.hours);
    if (!total || total <= 0) return onChange(null);
    const basis: PayBasis =
      next.mode === 'fixed'
        ? { mode: 'fixed', currency: receiveCurrency, localAmount: toNumber(next.fixed) }
        : {
            mode: 'hourly',
            currency: receiveCurrency,
            hourlyRate: toNumber(next.rate),
            hours: toNumber(next.hours),
          };
    onChange({ basis, localTotal: payBasisLocalTotal(basis), amountUsd: usdFromLocal(total, rate) });
  };

  const current = { mode, fixed: fixedText, rate: rateText, hours: hoursText };

  const onMode = (m: Mode) => {
    setMode(m);
    emit({ ...current, mode: m });
  };
  const onFixed = (v: string) => {
    setFixedText(v);
    emit({ ...current, mode: 'fixed', fixed: v });
  };
  const onRate = (v: string) => {
    setRateText(v);
    emit({ ...current, mode: 'hourly', rate: v });
  };
  const onHours = (v: string) => {
    setHoursText(v);
    emit({ ...current, mode: 'hourly', hours: v });
  };

  const decimals = receiveCurrency === 'USDC' ? 2 : 0;

  return (
    <div className="space-y-3">
      <SegmentedControl<Mode>
        size="sm"
        ariaLabel="How this payout is denominated"
        value={mode}
        onChange={onMode}
        segments={[
          { value: 'fixed', label: 'Fixed amount' },
          { value: 'hourly', label: 'Hourly' },
        ]}
      />

      {/* Hourly inputs — rate × hours in the contractor's currency */}
      {mode === 'hourly' && (
        <div className="grid grid-cols-[1fr_auto_5.5rem] items-end gap-2">
          <LocalField
            label="Hourly rate"
            id={id}
            autoFocus={autoFocus}
            value={rateText}
            onChange={onRate}
            unit={receiveCurrency}
          />
          <span className="pb-3 text-14 text-text-tertiary" aria-hidden>
            ×
          </span>
          <div>
            <p className="mb-1 text-12 text-text-tertiary">Hours</p>
            <div className="flex h-11 items-center rounded-md border border-border-subtle bg-raised px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]">
              <input
                inputMode="decimal"
                value={hoursText}
                placeholder="0"
                onChange={(e) => onHours(e.target.value)}
                className="money h-full w-full bg-transparent text-16 text-text-money outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary: contractor receives (local) → you pay (derived USD) */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        {/* Contractor receives — editable in fixed mode, derived in hourly */}
        <div>
          <p className="mb-1 text-12 text-text-tertiary">Contractor receives</p>
          {mode === 'fixed' ? (
            <div
              className={cn(
                'flex h-11 items-center gap-2 rounded-md border bg-raised px-3',
                anomaly ? 'border-l-2 border-l-warn border-border-subtle' : 'border-border-subtle',
                'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]',
              )}
            >
              <input
                id={mode === 'fixed' ? id : undefined}
                autoFocus={autoFocus}
                inputMode="decimal"
                value={fixedText}
                placeholder="0"
                onChange={(e) => onFixed(e.target.value)}
                className="money h-full w-full bg-transparent text-16 text-text-money outline-none placeholder:text-text-tertiary"
              />
              <span className="shrink-0 text-12 font-500 text-text-tertiary">{receiveCurrency}</span>
            </div>
          ) : (
            <div className="flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-sunken px-3">
              <span className="money w-full truncate text-16 text-text-money">
                {formatMoney(localTotal, receiveCurrency, { decimals })}
              </span>
              <span className="shrink-0 text-12 font-500 text-text-tertiary">{receiveCurrency}</span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden items-end pb-3.5 sm:flex" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-text-tertiary">
            <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* You pay — derived USD, read-only */}
        <div>
          <p className="mb-1 text-12 text-text-tertiary">You pay</p>
          <div className="flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-sunken px-3">
            <span className="money shrink-0 text-16 text-text-tertiary">$</span>
            <span className="money w-full truncate text-16 text-text-money">
              {amountUsd > 0 ? formatMoney(amountUsd, 'USD', { decimals: 2 }).replace('$', '') : '0.00'}
            </span>
            <span className="shrink-0 text-12 font-500 text-text-tertiary">USD</span>
          </div>
        </div>
      </div>

      {/* Live conversion line */}
      <p className="money text-12 text-text-tertiary">
        1 USD = {formatRate(rate)} {receiveCurrency} · mid-market rate, no spread
      </p>

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

function LocalField({
  label,
  id,
  autoFocus,
  value,
  onChange,
  unit,
}: {
  label: string;
  id?: string;
  autoFocus?: boolean;
  value: string;
  onChange: (v: string) => void;
  unit: CurrencyCode;
}) {
  return (
    <div>
      <p className="mb-1 text-12 text-text-tertiary">{label}</p>
      <div className="flex h-11 items-center gap-2 rounded-md border border-border-subtle bg-raised px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]">
        <input
          id={id}
          autoFocus={autoFocus}
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className="money h-full w-full bg-transparent text-16 text-text-money outline-none placeholder:text-text-tertiary"
        />
        <span className="shrink-0 text-12 font-500 text-text-tertiary">{unit}</span>
      </div>
    </div>
  );
}
