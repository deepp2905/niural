import type { Rail } from '../lib/types';
import type { Settlement } from '../lib/settlement';
import { formatUSD, formatMoney, formatRate, formatDateShort } from '../lib/format';
import { Popover } from './ui/Popover';
import { MorphNumber } from './MorphNumber';
import { cn } from '../lib/cn';

const RAIL_LABEL: Record<Rail, string> = {
  IMPS: 'IMPS (local rails)',
  NEFT: 'NEFT',
  ACH: 'ACH',
  'local-rails': 'local rails',
  wallet: 'Paynetic Wallet',
  usdc: 'USDC transfer',
};

/** The settlement ledger — the visual signature of the prototype (§5A). Reads
 *  like the money's itinerary; the recipient amount is the dominant number.
 *  `emphasis` switches sender-side (admin) vs recipient-side (contractor). */
export function SettlementLedger({
  settlement,
  recipientName,
  emphasis = 'admin',
  className,
}: {
  settlement: Settlement;
  recipientName: string;
  emphasis?: 'admin' | 'contractor';
  className?: string;
}) {
  const receiveHeadline = formatMoney(settlement.receiveAmount, settlement.receiveCurrency, {
    decimals: settlement.receiveCurrency === 'USDC' ? 2 : 0,
  });
  const receiveExact = formatMoney(settlement.receiveAmount, settlement.receiveCurrency, {
    decimals: 2,
  });
  const first = recipientName.split(' ')[0];

  return (
    <div className={cn('rounded-xl border border-border-subtle bg-raised', className)}>
      <dl className="divide-y divide-border-subtle">
        <LedgerRow label="You send">
          <span className="money text-14 text-text-money">{formatUSD(settlement.youSendUsd)} USD</span>
        </LedgerRow>

        <LedgerRow label="Platform fee">
          <span className="money text-14 text-text-secondary">
            {settlement.senderCoversFees ? '+' : '−'}
            {formatUSD(settlement.feeUsd)}
          </span>
        </LedgerRow>

        <LedgerRow
          label={
            <span className="inline-flex items-center gap-1">
              Converted at{' '}
              <span className="money text-text-secondary">{formatRate(settlement.rate)}</span>
              <Popover
                trigger={
                  <button
                    type="button"
                    aria-label="Rate details"
                    className="grid h-4 w-4 place-items-center rounded-full border border-border-strong text-[10px] text-text-tertiary hover:text-text-primary"
                  >
                    i
                  </button>
                }
              >
                <p className="text-13 text-text-secondary">
                  Mid-market rate from the mock feed. Paynetic charges no FX spread; our fee is the{' '}
                  <span className="money">{formatUSD(settlement.feeUsd)}</span> shown.
                </p>
              </Popover>
            </span>
          }
        >
          <span className="text-13 text-text-tertiary">
            mid-market rate{settlement.rateLocked ? ', locked' : ''}
          </span>
        </LedgerRow>

        {/* Headline: recipient receives — the dominant number on the page. */}
        <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
          <dt className="text-13 text-text-secondary">
            {emphasis === 'contractor' ? 'You receive' : `${first} receives`}
          </dt>
          <dd className="flex items-baseline gap-2">
            <MorphNumber
              value={receiveHeadline}
              className="money text-32 font-500 leading-none text-text-money"
            />
            <span className="money text-13 text-text-tertiary">{settlement.receiveCurrency}</span>
          </dd>
        </div>

        <LedgerRow label="Exact amount">
          <span className="money text-13 text-text-tertiary">
            {receiveExact} {settlement.receiveCurrency}
          </span>
        </LedgerRow>

        <LedgerRow label="Arrives">
          <span className="text-13 text-text-primary">
            {formatDateShort(settlement.arrivesAt)} · via {RAIL_LABEL[settlement.rail]}
          </span>
        </LedgerRow>
      </dl>
    </div>
  );
}

function LedgerRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className="text-13 text-text-secondary">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
