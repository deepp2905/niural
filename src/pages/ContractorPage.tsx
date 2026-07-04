import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { getPayout, getContractor, rateFor, COMPANY_NAME } from '../lib/mock';
import { settlementFromMethod } from '../lib/settlement';
import { formatMoney, formatUSD, formatRate, formatDateShort } from '../lib/format';
import { Timeline } from '../components/ui/Timeline';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon } from '../components/ui/Icon';
import { Logo } from '../components/brand/Logo';

/** Contractor-side remittance view (§6f). Rendered in a device-suggestive
 *  frame; recipient emphasis on the same settlement object the admin saw. */
export function ContractorPage() {
  const { payoutId } = useParams();
  const sent = useStore((s) => (payoutId ? s.sentPayouts[payoutId] : undefined));
  const payout = sent ?? (payoutId ? getPayout(payoutId) : undefined);
  const contractor = payout ? getContractor(payout.contractorId) : undefined;

  return (
    <div className="min-h-screen bg-sunken px-4 py-10">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[24px] border border-border-subtle bg-page shadow-takeover">
          {/* app bar */}
          <div className="flex items-center justify-center border-b border-border-subtle px-5 py-3.5">
            <Logo className="scale-95" />
          </div>

          {!payout || !contractor ? (
            <div className="px-5 py-16 text-center text-13 text-text-secondary">
              No remittance matches “{payoutId}”.
            </div>
          ) : (
            <Remittance payout={payout} contractor={contractor} />
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            to="/payments"
            className="inline-flex items-center gap-1.5 text-12 text-text-tertiary hover:text-text-secondary"
          >
            <ArrowLeftIcon size={13} />
            Back to admin app
          </Link>
        </div>
      </div>
    </div>
  );
}

function Remittance({
  payout,
  contractor,
}: {
  payout: NonNullable<ReturnType<typeof getPayout>>;
  contractor: NonNullable<ReturnType<typeof getContractor>>;
}) {
  const rate = rateFor(contractor.currency);
  const settlement = settlementFromMethod({
    amountSendUsd: payout.amountSendUsd,
    receiveCurrency: contractor.currency,
    rate,
    method: payout.method,
    senderCoversFees: payout.senderCoversFees,
    arrivesAt: payout.arrivesAt ?? new Date().toISOString(),
  });

  const receive = formatMoney(settlement.receiveAmount, contractor.currency, {
    decimals: contractor.currency === 'USDC' ? 2 : 0,
  });
  const arrived = payout.status === 'paid';

  return (
    <div className="px-5 pb-8 pt-6">
      <p className="text-12 text-text-tertiary">From {COMPANY_NAME} · via Paynetic</p>

      {/* Headline */}
      <div className="mt-3">
        <p className="money text-32 font-500 leading-tight text-text-money">{receive}</p>
        <p className="mt-1 text-14 text-text-secondary">
          {arrived ? 'arrived' : 'arriving'} {formatDateShort(settlement.arrivesAt)}
        </p>
      </div>

      {/* Breakdown */}
      <dl className="mt-6 space-y-2.5 rounded-xl border border-border-subtle bg-raised p-4 text-13">
        <Row label="Invoice amount">
          <span className="money text-text-primary">{formatUSD(payout.amountSendUsd)}</span>
        </Row>
        <Row label="Exchange rate">
          <span className="money text-text-secondary">{formatRate(rate)}</span>
        </Row>
        <Row label="Fee">
          <span className="text-text-secondary">
            {settlement.senderCoversFees ? 'paid by sender' : `${formatUSD(settlement.feeUsd)} deducted`}
          </span>
        </Row>
        <Row label="Deducted from you">
          <span className={settlement.senderCoversFees ? 'text-success' : 'text-text-secondary'}>
            {settlement.senderCoversFees ? 'nothing' : formatUSD(settlement.feeUsd)}
          </span>
        </Row>
      </dl>

      {/* Timeline */}
      <div className="mt-6">
        <p className="mb-3 text-12 font-500 uppercase tracking-wide text-text-tertiary">Status</p>
        <Timeline events={payout.timeline} />
      </div>

      {/* FIRA */}
      <div className="mt-6 border-t border-border-subtle pt-5">
        <Button variant="secondary" className="w-full">
          Download FIRA
        </Button>
        <p className="mt-2 text-12 leading-relaxed text-text-tertiary">
          Foreign inward remittance advice — proof of export earnings for your GST filing.
        </p>
      </div>

      <p className="mt-5 text-12 text-text-tertiary">
        Invoice {payout.invoiceNumber ?? '—'} · paid by {COMPANY_NAME}
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-tertiary">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
