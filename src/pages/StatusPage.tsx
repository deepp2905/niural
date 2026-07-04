import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { getPayout, getContractor, rateFor } from '../lib/mock';
import { settlementFromMethod } from '../lib/settlement';
import { formatUSD } from '../lib/format';
import { useCountdown } from '../lib/useCountdown';
import { Timeline } from '../components/ui/Timeline';
import { ProgressRing } from '../components/ui/ProgressRing';
import { SettlementLedger } from '../components/SettlementLedger';
import { StatusChip } from '../components/ui/StatusChip';
import { Banner } from '../components/ui/Banner';
import { Button } from '../components/ui/Button';
import { ContractorAvatar } from '../components/ContractorAvatar';
import { FallbackLadder } from '../features/status/FallbackLadder';
import { formatCountdown } from '../lib/format';

const CANCEL_WINDOW_SECONDS = 1800; // 30:00

export function StatusPage() {
  const { payoutId } = useParams();
  const sent = useStore((s) => (payoutId ? s.sentPayouts[payoutId] : undefined));
  const cancelled = useStore((s) => (payoutId ? s.cancelled[payoutId] : false));
  const cancelPayout = useStore((s) => s.cancelPayout);

  const payout = sent ?? (payoutId ? getPayout(payoutId) : undefined);
  const contractor = payout ? getContractor(payout.contractorId) : undefined;

  const cancel = useCountdown(CANCEL_WINDOW_SECONDS, !!payout && payout.status === 'processing' && !cancelled);

  if (!payout || !contractor) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="money text-20 text-text-tertiary">Payout not found</p>
        <p className="mt-2 text-13 text-text-secondary">No payout matches “{payoutId}”.</p>
        <Link to="/payments" className="mt-4 inline-block text-13 text-info underline underline-offset-2">
          Back to payments
        </Link>
      </div>
    );
  }

  const settlement = settlementFromMethod({
    amountSendUsd: payout.amountSendUsd,
    receiveCurrency: contractor.currency,
    rate: rateFor(contractor.currency),
    method: payout.method,
    senderCoversFees: payout.senderCoversFees,
    arrivesAt: payout.arrivesAt ?? new Date().toISOString(),
  });

  const showCancel = payout.status === 'processing' && !cancelled;
  const canCancel = showCancel && !cancel.expired;

  const headline =
    payout.status === 'paid'
      ? `${formatUSD(payout.amountSendUsd)} sent to ${contractor.name}`
      : payout.status === 'failed'
        ? `Payout to ${contractor.name} failed`
        : payout.status === 'held'
          ? `Payout to ${contractor.name} is held`
          : payout.status === 'scheduled'
            ? `Payout to ${contractor.name} is scheduled`
            : cancelled
              ? `Payout to ${contractor.name} cancelled`
              : `Sending ${formatUSD(payout.amountSendUsd)} to ${contractor.name}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ContractorAvatar contractor={contractor} size="lg" />
          <div>
            <h1 className="text-20 font-600 tracking-tight text-text-primary">{headline}</h1>
            <p className="mt-0.5 flex items-center gap-2 text-12 text-text-tertiary">
              <span className="money">{payout.invoiceNumber ?? payout.id}</span>
              <StatusChip status={cancelled ? 'draft' : payout.status} pulse />
            </p>
          </div>
        </div>
      </div>

      {cancelled && (
        <Banner tone="neutral" title="Payout cancelled">
          Funds returned to your USD balance. No fees were charged.
        </Banner>
      )}

      {payout.status === 'failed' && payout.failureReason && (
        <Banner tone="danger" title="Receiving bank rejected this payout">
          {payout.failureReason}
        </Banner>
      )}

      {payout.status === 'held' && (
        <Banner tone="warn" title="Held pending compliance">
          This payout is scheduled and will send automatically once the block clears. Nothing has
          moved.
        </Banner>
      )}

      {/* Settlement summary */}
      <SettlementLedger settlement={settlement} recipientName={contractor.name} />

      {/* Cancel window */}
      {showCancel && (
        <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-raised p-4">
          <div>
            <p className="text-13 font-500 text-text-primary">
              {canCancel ? 'You can still cancel' : 'Payout is in transit'}
            </p>
            <p className="text-12 text-text-tertiary">
              {canCancel
                ? 'Cancel within the 30-minute window — funds return instantly.'
                : 'The cancel window has closed.'}
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={!canCancel}
            onClick={() => payoutId && cancelPayout(payoutId)}
            className="gap-2"
          >
            <ProgressRing progress={cancel.progress} className="text-danger" />
            {canCancel ? (
              <span className="money">{formatCountdown(cancel.remaining)}</span>
            ) : (
              'In transit'
            )}
            {canCancel && <span>Cancel</span>}
          </Button>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-border-subtle bg-raised p-5">
        <p className="mb-4 text-12 font-500 uppercase tracking-wide text-text-tertiary">Tracking</p>
        <Timeline events={payout.timeline} />
      </div>

      {/* Failed → fallback ladder */}
      {payout.status === 'failed' && <FallbackLadder contractor={contractor} />}

      {/* Contractor view link */}
      <div className="flex items-center justify-between border-t border-border-subtle pt-4">
        <Link to={`/contractor/${payout.id}`} className="text-13 text-info underline underline-offset-2">
          See {contractor.name.split(' ')[0]}'s view →
        </Link>
        <Link to="/payments" className="text-13 text-text-secondary hover:text-text-primary">
          Back to payments
        </Link>
      </div>
    </div>
  );
}
