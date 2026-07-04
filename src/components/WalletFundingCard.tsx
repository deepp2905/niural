import type { WalletImpact } from '../lib/settlement';
import { formatUSD, formatDateShort } from '../lib/format';
import { addBusinessDays } from '../lib/review';
import { AlertTriangleIcon } from './ui/Icon';

/** Condensed funding card on the review screen (§5C). Enters a warning state
 *  when the payout exceeds the wallet balance (§6b). */
export function WalletFundingCard({ impact }: { impact: WalletImpact }) {
  if (impact.sufficient) {
    return (
      <div className="rounded-xl border border-border-subtle bg-raised p-4">
        <p className="text-13 text-text-secondary">
          Paying from USD balance ·{' '}
          <span className="money text-text-primary">{formatUSD(impact.balanceBeforeUsd)}</span>{' '}
          available
        </p>
        <p className="mt-1 text-12 text-text-tertiary">
          <span className="money">{formatUSD(impact.balanceAfterUsd)}</span> after this payout
        </p>
      </div>
    );
  }

  const topUpArrival = addBusinessDays(new Date('2026-07-03T12:00:00Z'), 3);
  return (
    <div className="rounded-xl border border-border-subtle bg-warn-surface p-4">
      <p className="flex items-center gap-1.5 text-13 font-500 text-text-primary">
        <AlertTriangleIcon size={15} className="shrink-0 text-warn" />
        This payout exceeds your USD balance by{' '}
        <span className="money">{formatUSD(impact.shortfallUsd)}</span>
      </p>
      <p className="mt-1.5 text-12 leading-relaxed text-text-secondary">
        Top up via ACH (arrives {formatDateShort(topUpArrival)} — the payout would auto-send on
        arrival) or reduce the amount.
      </p>
    </div>
  );
}
