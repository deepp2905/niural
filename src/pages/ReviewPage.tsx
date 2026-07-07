import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { WALLET, WALLET_LOW_BALANCE } from '../lib/mock';
import {
  resolveDraft,
  buildChecks,
  hasBlockingCheck,
  identicalMonthlyCount,
  buildSentPayout,
  demoDraft,
} from '../lib/review';
import { settlementFromMethod, walletImpact, reQuote } from '../lib/settlement';
import { formatUSD, formatMoney, formatRate, formatPayBasis } from '../lib/format';
import { useCountdown } from '../lib/useCountdown';
import { SettlementLedger } from '../components/SettlementLedger';
import { ChecksStrip } from '../components/ChecksStrip';
import { WalletFundingCard } from '../components/WalletFundingCard';
import { RecurringPrompt } from '../features/review/RecurringPrompt';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { CountdownChip } from '../components/ui/CountdownChip';
import { Button } from '../components/ui/Button';
import { Banner } from '../components/ui/Banner';
import { ContractorAvatar } from '../components/ContractorAvatar';
import { CheckIcon } from '../components/ui/Icon';
import { cn } from '../lib/cn';

const RATE_LOCK_SECONDS = 900; // 15:00

export function ReviewPage() {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const storeDraft = useStore((s) => (draftId ? s.drafts[draftId] : undefined));
  const recordSentPayout = useStore((s) => s.recordSentPayout);
  const dismissed = useStore((s) => s.dismissed);
  const dismiss = useStore((s) => s.dismiss);
  const lowBalance = useStore((s) => s.lowBalanceScenario);
  const dark = useStore((s) => s.reviewDark);
  const setReviewDark = useStore((s) => s.setReviewDark);

  const draft = storeDraft ?? demoDraft();
  const resolved = useMemo(() => resolveDraft(draft), [draft]);

  // Leave the shell light when we navigate away from review.
  useEffect(() => () => setReviewDark(false), [setReviewDark]);

  const [senderCovers, setSenderCovers] = useState(draft.senderCoversFees);
  const [rate, setRate] = useState(resolved?.rate ?? 1);
  const [heldLong, setHeldLong] = useState(false);
  const [renewalRequested, setRenewalRequested] = useState(false);

  const countdown = useCountdown(RATE_LOCK_SECONDS, !heldLong);
  const expired = countdown.expired && !heldLong;

  if (!resolved) {
    return <div className="p-8 text-13 text-text-secondary">Draft not found.</div>;
  }
  const { contractor, method, expiryRate, arrivesAt } = resolved;

  const settlement = settlementFromMethod({
    amountSendUsd: draft.amountSendUsd,
    receiveCurrency: contractor.currency,
    rate,
    method,
    senderCoversFees: senderCovers,
    arrivesAt,
    rateLocked: !expired,
  });

  const balance = lowBalance ? WALLET_LOW_BALANCE : WALLET.balanceUsd;
  const impact = walletImpact(balance, settlement);
  const checks = buildChecks(contractor, draft, method);
  const blocking = hasBlockingCheck(checks) && !renewalRequested;
  const recurringCount = identicalMonthlyCount(contractor, draft.amountSendUsd);
  const showRecurring =
    recurringCount >= 2 && !blocking && impact.sufficient && !dismissed[`recurring_${draft.id}`];

  const expiryDelta = reQuote(settlement, expiryRate);

  // Commit label + resulting status (the button never lies about the total).
  const commit = blocking
    ? { label: 'Send when cleared', status: 'held' as const, note: 'Scheduled until compliance clears. Nothing moves before then.' }
    : !impact.sufficient
      ? { label: 'Top up & schedule send', status: 'scheduled' as const, note: 'ACH top-up initiated; the payout auto-sends when funds land.' }
      : { label: `Send ${formatUSD(settlement.totalDebitUsd)}`, status: 'processing' as const, note: 'You can cancel within 30 minutes of sending.' };

  const onCommit = () => {
    const payout = buildSentPayout(draft, resolved, commit.status, rate);
    recordSentPayout(payout);
    navigate(`/payments/status/${payout.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        {/* Screen header with the theme toggle (only this screen, §5) */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-24 font-600 tracking-tight text-text-primary">Review &amp; confirm</h1>
            <p className="mt-1 text-13 text-text-secondary">
              Every figure below is final and verifiable. Nothing moves until you send.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReviewDark(!dark)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border-subtle bg-raised text-text-secondary hover:text-text-primary"
            aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            title="Toggle theme (this screen)"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          {/* Main column */}
          <div className="space-y-5">
            {/* Rate lock row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {heldLong ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-sunken px-2 py-0.5 text-12 text-text-secondary">
                    Rate held for 24h
                  </span>
                ) : (
                  <CountdownChip seconds={countdown.remaining} />
                )}
              </div>
              {!heldLong && !expired && (
                <button
                  type="button"
                  onClick={() => setHeldLong(true)}
                  className="text-12 text-text-secondary underline underline-offset-2 hover:text-text-primary"
                >
                  Hold for 24h
                </button>
              )}
            </div>

            {expired && (
              <Banner
                tone="warn"
                title="Rate expired"
                actions={
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setRate(expiryRate);
                        countdown.reset(RATE_LOCK_SECONDS);
                      }}
                    >
                      Accept new rate
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setHeldLong(true)}>
                      Hold this rate 24h
                    </Button>
                  </>
                }
              >
                New rate <span className="money">{formatRate(expiryRate)}</span> — {contractor.name.split(' ')[0]}{' '}
                would receive{' '}
                <span className={cn('money', expiryDelta.direction === 'less' ? 'text-danger' : 'text-success')}>
                  {formatMoney(Math.abs(expiryDelta.receiveDelta), contractor.currency, { decimals: 0 })}{' '}
                  {contractor.currency}
                </span>{' '}
                {expiryDelta.direction}.
              </Banner>
            )}

            {/* Settlement ledger */}
            <div className={cn('transition-opacity', expired && 'opacity-60')}>
              <SettlementLedger settlement={settlement} recipientName={contractor.name} />
            </div>

            {/* Fee-bearer toggle */}
            <div>
              <SegmentedControl
                ariaLabel="Who covers the fee"
                value={senderCovers ? 'cover' : 'deduct'}
                onChange={(v) => setSenderCovers(v === 'cover')}
                segments={[
                  { value: 'cover', label: 'You cover fees' },
                  { value: 'deduct', label: 'Fees deducted from payout' },
                ]}
              />
              <p className="mt-2 text-12 text-text-tertiary">
                {senderCovers
                  ? `${contractor.name.split(' ')[0]} receives the full ${formatUSD(draft.amountSendUsd)} equivalent; the ${formatUSD(settlement.feeUsd)} fee is added to your debit.`
                  : `The ${formatUSD(settlement.feeUsd)} fee comes out of the payout; ${contractor.name.split(' ')[0]} receives slightly less.`}
              </p>
            </div>

            {/* Funding */}
            <WalletFundingCard impact={impact} />

            {/* Checks */}
            <div className="space-y-2">
              <p className="text-12 font-500 uppercase tracking-wide text-text-tertiary">Checks</p>
              <ChecksStrip
                checks={checks}
                onRequestRenewal={() => setRenewalRequested(true)}
              />
              {renewalRequested && (
                <p className="flex items-center gap-1.5 text-12 text-success">
                  <CheckIcon size={13} className="shrink-0" />
                  Renewal request sent to {contractor.name.split(' ')[0]} — the payout sends
                  automatically once the form is on file.
                </p>
              )}
            </div>

            {/* Recurring */}
            {showRecurring && (
              <RecurringPrompt
                contractor={contractor}
                amountUsd={draft.amountSendUsd}
                count={recurringCount}
                onDismiss={() => dismiss(`recurring_${draft.id}`)}
              />
            )}

            {/* Commit */}
            <div className="border-t border-border-subtle pt-5">
              <Button size="lg" className="w-full" onClick={onCommit}>
                {commit.label}
              </Button>
              <p className="mt-2 text-center text-12 text-text-tertiary">{commit.note}</p>
            </div>
          </div>

          {/* Meta rail */}
          <aside className="hidden space-y-4 lg:block">
            <div className="rounded-xl border border-border-subtle bg-raised p-4">
              <div className="flex items-center gap-2.5">
                <ContractorAvatar contractor={contractor} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-13 font-600 text-text-primary">{contractor.name}</p>
                  <p className="text-12 text-text-tertiary">{contractor.country}</p>
                </div>
              </div>
              <dl className="mt-3 space-y-2 text-12">
                <RailRow label="Invoice" value={draft.invoiceNumber ?? '—'} mono />
                {draft.payBasis && (
                  <RailRow label="Basis" value={formatPayBasis(draft.payBasis)} mono />
                )}
                <RailRow label="Method" value={method.label} />
                <RailRow label="Debit" value={`${formatUSD(settlement.totalDebitUsd)}`} mono />
              </dl>
            </div>
            <p className="px-1 text-12 leading-relaxed text-text-tertiary">
              The agent prepared this payout. Disbursement is always your commit — nothing here has
              moved money.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className={cn('truncate text-text-primary', mono && 'money')}>{value}</dd>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
