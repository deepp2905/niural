import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BULK_ITEMS, getContractor } from '../lib/mock';
import { useStore } from '../lib/store';
import { formatUSD, formatCountdown } from '../lib/format';
import { useCountdown } from '../lib/useCountdown';
import { FlaggedCard } from '../features/bulk/FlaggedCard';
import { CleanRow } from '../features/bulk/CleanRow';
import { PolicyDrawer } from '../features/bulk/PolicyDrawer';
import { SparkGlyph } from '../components/ui/AIChip';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';

const HOLD_WINDOW_SECONDS = 2700; // 45:00

export function BulkPage() {
  const resolved = useStore((s) => s.bulkResolved);
  const resolveBulkItem = useStore((s) => s.resolveBulkItem);
  const unresolveBulkItem = useStore((s) => s.unresolveBulkItem);

  const [heldClean, setHeldClean] = useState<Record<string, boolean>>({});
  const [batchApproved, setBatchApproved] = useState(false);
  const [sent, setSent] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const flagged = useMemo(() => BULK_ITEMS.filter((i) => i.verdict === 'flagged'), []);
  const clean = useMemo(() => BULK_ITEMS.filter((i) => i.verdict === 'clean'), []);

  const total = BULK_ITEMS.reduce((s, i) => s + i.amountUsd, 0);
  const pendingFlagged = flagged.filter((i) => !resolved[i.payoutDraftId]);
  const approvedFlagged = flagged.filter((i) => resolved[i.payoutDraftId] === 'approved');
  const eligibleClean = clean.filter((i) => !heldClean[i.payoutDraftId]);
  const batchCount = eligibleClean.length + approvedFlagged.length;

  const hold = useCountdown(HOLD_WINDOW_SECONDS, batchApproved && !sent);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-24 font-600 tracking-tight text-text-primary">Bulk approval</h1>
          <Link to="/payments" className="text-13 text-text-secondary hover:text-text-primary">
            Back to payments
          </Link>
        </div>
        <p className="mt-1 text-13 text-text-secondary">
          <span className="money">{BULK_ITEMS.length}</span> payouts pending ·{' '}
          <span className="money">{formatUSD(total)}</span> total ·{' '}
          <span className="text-success">{clean.length} clean</span>,{' '}
          <span className="text-warn">{pendingFlagged.length} need review</span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-13 text-text-secondary">
          <SparkGlyph className="shrink-0 text-ai" />
          I've checked each against contract terms, payment history, and account changes.
        </p>
      </div>

      {batchApproved ? (
        <PostApproval
          count={batchCount}
          hold={hold}
          sent={sent}
          onSendNow={() => setSent(true)}
          onReview={() => setBatchApproved(false)}
        />
      ) : (
        <>
          {/* Flagged */}
          {pendingFlagged.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-13 font-600 text-text-primary">Needs review</h2>
              {flagged.map((item) => {
                const contractor = getContractor(item.contractorId)!;
                return (
                  <FlaggedCard
                    key={item.payoutDraftId}
                    item={item}
                    contractor={contractor}
                    resolution={resolved[item.payoutDraftId]}
                    onApprove={() => resolveBulkItem(item.payoutDraftId, 'approved')}
                    onHold={() => resolveBulkItem(item.payoutDraftId, 'held')}
                    onUndo={() => unresolveBulkItem(item.payoutDraftId)}
                  />
                );
              })}
            </section>
          )}

          {/* Resolved flagged (approved/held) shown compact when none pending */}
          {pendingFlagged.length === 0 && flagged.some((i) => resolved[i.payoutDraftId]) && (
            <section className="space-y-2.5">
              <h2 className="text-13 font-600 text-text-primary">Reviewed</h2>
              {flagged.map((item) => {
                const contractor = getContractor(item.contractorId)!;
                return (
                  <FlaggedCard
                    key={item.payoutDraftId}
                    item={item}
                    contractor={contractor}
                    resolution={resolved[item.payoutDraftId]}
                    onApprove={() => resolveBulkItem(item.payoutDraftId, 'approved')}
                    onHold={() => resolveBulkItem(item.payoutDraftId, 'held')}
                    onUndo={() => unresolveBulkItem(item.payoutDraftId)}
                  />
                );
              })}
            </section>
          )}

          {/* Clean */}
          <section className="space-y-2">
            <h2 className="text-13 font-600 text-text-primary">Clean</h2>
            <div className="rounded-xl border border-border-subtle bg-raised">
              {clean.map((item) => {
                const contractor = getContractor(item.contractorId)!;
                return (
                  <CleanRow
                    key={item.payoutDraftId}
                    item={item}
                    contractor={contractor}
                    held={!!heldClean[item.payoutDraftId]}
                    onToggleHold={() =>
                      setHeldClean((h) => ({ ...h, [item.payoutDraftId]: !h[item.payoutDraftId] }))
                    }
                  />
                );
              })}
            </div>
          </section>

          {/* Batch actions */}
          <div className="sticky bottom-4 rounded-xl border border-border-subtle bg-raised p-4 shadow-raised">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-12 text-text-tertiary">
                Payouts over <span className="money">$5,000</span> always require individual approval
                — company policy.{' '}
                <button
                  type="button"
                  onClick={() => setPolicyOpen(true)}
                  className="underline underline-offset-2 hover:text-text-primary"
                >
                  Edit policy
                </button>
              </p>
              <Button size="lg" disabled={batchCount === 0} onClick={() => setBatchApproved(true)}>
                Approve {batchCount} {batchCount === 1 ? 'payout' : 'payouts'}
              </Button>
            </div>
          </div>
        </>
      )}

      <PolicyDrawer open={policyOpen} onOpenChange={setPolicyOpen} />
    </div>
  );
}

/** Approval ≠ disbursement (§7E): approved payouts sit in a hold window. */
function PostApproval({
  count,
  hold,
  sent,
  onSendNow,
  onReview,
}: {
  count: number;
  hold: ReturnType<typeof useCountdown>;
  sent: boolean;
  onSendNow: () => void;
  onReview: () => void;
}) {
  if (sent) {
    return (
      <div className="rounded-xl border border-border-subtle bg-success-surface p-6 text-center">
        <p className="text-16 font-600 text-text-primary">{count} payouts sent</p>
        <p className="mt-1 text-13 text-text-secondary">
          Each is now tracking individually on the payments dashboard.
        </p>
        <Link
          to="/payments"
          className="mt-4 inline-block rounded-md bg-action-primary px-3.5 py-2 text-13 font-500 text-text-inverse hover:bg-action-primary-hover"
        >
          Go to payments
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-raised p-6">
      <div className="flex items-center gap-3">
        <ProgressRing progress={hold.progress} size={40} stroke={3} className="text-action-primary">
          <span className="money text-11 text-text-secondary">{Math.ceil(hold.remaining / 60)}m</span>
        </ProgressRing>
        <div>
          <p className="text-16 font-600 text-text-primary">{count} payouts approved</p>
          <p className="text-13 text-text-secondary">
            Sending in <span className="money">{formatCountdown(hold.remaining)}</span> — approval
            isn't disbursement. Nothing has moved yet.
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onSendNow}>Send now</Button>
        <Button variant="secondary" onClick={onReview}>
          Review batch
        </Button>
      </div>
    </div>
  );
}
