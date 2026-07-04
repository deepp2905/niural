import type { Contractor, PayoutMethod, PayoutMethodKind } from '../../lib/types';
import { formatUSD } from '../../lib/format';
import { VerificationBadge } from '../../components/VerificationBadge';
import { cn } from '../../lib/cn';

const KIND_LABEL: Record<PayoutMethodKind, string> = {
  bank: 'Bank transfer',
  wallet: 'Paynetic Wallet',
  stablecoin: 'Stablecoin (USDC)',
};

/** One-line note per method, jurisdiction-aware for stablecoin (§4a.3). */
function methodNote(contractor: Contractor, method: PayoutMethod): string {
  const first = contractor.name.split(' ')[0];
  if (method.kind === 'wallet') return 'Instant to Paynetic Wallet · withdraw to local rails anytime.';
  if (method.kind === 'bank') return `Arrives via ${method.rail} · ETA ${method.eta}.`;
  // stablecoin
  if (contractor.cryptoOptIn) {
    return `${first} receives USDC to a self-custody wallet · avoids ${localCcyName(contractor)} volatility.`;
  }
  if (contractor.countryCode === 'IN') {
    return `${first} hasn't opted into crypto payouts. Stablecoin receipts in India carry VDA tax treatment (30% + 1% TDS) for the recipient.`;
  }
  return `${first} hasn't opted into crypto payouts.`;
}

function localCcyName(contractor: Contractor): string {
  if (contractor.countryCode === 'AR') return 'ARS';
  return contractor.currency;
}

export function MethodCards({
  contractor,
  value,
  onChange,
}: {
  contractor: Contractor;
  value: PayoutMethodKind;
  onChange: (kind: PayoutMethodKind) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {contractor.methods.map((method) => {
        const selectable = method.kind !== 'stablecoin' || contractor.cryptoOptIn;
        const active = value === method.kind && selectable;
        return (
          <button
            key={method.kind}
            type="button"
            disabled={!selectable}
            aria-pressed={active}
            onClick={() => selectable && onChange(method.kind)}
            className={cn(
              'flex flex-col rounded-lg border p-3 text-left transition-colors',
              active
                ? 'border-action-primary bg-raised ring-1 ring-action-primary'
                : 'border-border-subtle bg-raised hover:border-border-strong',
              !selectable && 'cursor-not-allowed opacity-70 hover:border-border-subtle',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-13 font-600 text-text-primary">{KIND_LABEL[method.kind]}</span>
              <span className="money text-12 text-text-secondary">{formatUSD(method.feeUsd)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-12 text-text-tertiary">ETA {method.eta}</span>
              {method.kind === 'bank' && (
                <VerificationBadge
                  verified={method.verification.verified}
                  method={method.verification.method}
                />
              )}
            </div>
            <p
              className={cn(
                'mt-2 text-12 leading-snug',
                !selectable && contractor.countryCode === 'IN' ? 'text-warn' : 'text-text-tertiary',
              )}
            >
              {methodNote(contractor, method)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
