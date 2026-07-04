import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BulkItem, Contractor } from '../../lib/types';
import { formatUSD } from '../../lib/format';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { SparkGlyph } from '../../components/ui/AIChip';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/cn';

type Resolution = 'approved' | 'held' | undefined;

/** A flagged payout in the bulk batch (§7B). The anomaly reason is the primary
 *  text; evidence expands. Fraud rows require typing the contractor name to
 *  approve anyway — the one place friction is deliberately added. */
export function FlaggedCard({
  item,
  contractor,
  resolution,
  onApprove,
  onHold,
  onUndo,
}: {
  item: BulkItem;
  contractor: Contractor;
  resolution: Resolution;
  onApprove: () => void;
  onHold: () => void;
  onUndo: () => void;
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const first = contractor.name.split(' ')[0];
  const nameMatches = typed.trim().toLowerCase() === contractor.name.toLowerCase();

  if (resolution) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-raised px-4 py-3">
        <div className="flex items-center gap-2.5">
          <ContractorAvatar contractor={contractor} size="sm" />
          <span className="text-13 text-text-primary">{contractor.name}</span>
          <span className="money text-12 text-text-tertiary">{formatUSD(item.amountUsd)}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-11 font-500',
              resolution === 'approved' ? 'bg-success-surface text-success' : 'bg-sunken text-text-secondary',
            )}
          >
            {resolution === 'approved' ? 'Approved — joins the batch' : 'Held — removed from this run'}
          </span>
        </div>
        <button type="button" onClick={onUndo} className="text-12 text-text-secondary underline underline-offset-2 hover:text-text-primary">
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-raised p-4">
      <div className="flex items-start gap-3">
        <ContractorAvatar contractor={contractor} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-13 font-600 text-text-primary">{contractor.name}</span>
            <span className="money text-13 text-text-primary">{formatUSD(item.amountUsd)}</span>
          </div>

          {/* Anomaly reason = primary text, agent-voiced */}
          <p className="mt-1.5 flex items-start gap-1.5 text-13 leading-snug text-text-primary">
            <SparkGlyph className="mt-1 shrink-0 text-ai" />
            {item.reason}
          </p>

          {/* Evidence */}
          <button
            type="button"
            onClick={() => setEvidenceOpen((o) => !o)}
            aria-expanded={evidenceOpen}
            className="mt-2 text-12 text-text-secondary underline underline-offset-2 hover:text-text-primary"
          >
            {evidenceOpen ? 'Hide evidence' : 'Show evidence'}
          </button>
          {evidenceOpen && (
            <ul className="mt-2 space-y-1 border-l-2 border-border-subtle pl-3">
              {item.evidence.map((e, i) => (
                <li key={i} className="text-12 text-text-secondary">
                  {e}
                </li>
              ))}
            </ul>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.requiresNameConfirm ? (
              <>
                <Button size="sm" onClick={onApprove /* used as "verify" primary */}>
                  Verify with {first}
                </Button>
                {!confirmOpen ? (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(true)}>
                    Approve anyway
                  </Button>
                ) : (
                  <div className="flex w-full flex-col gap-2 rounded-lg border border-border-subtle bg-warn-surface p-2.5 sm:flex-row sm:items-center">
                    <span className="text-12 text-text-secondary">
                      Type <span className="font-600 text-text-primary">{contractor.name}</span> to
                      approve despite the fraud pattern:
                    </span>
                    <Input
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      placeholder={contractor.name}
                      className="h-8 sm:w-44"
                      inputClassName="text-12"
                      accent={nameMatches ? 'none' : 'warn'}
                    />
                    <Button size="sm" variant="danger" disabled={!nameMatches} onClick={onApprove}>
                      Approve anyway
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Button size="sm" onClick={onApprove}>
                  Approve individually
                </Button>
                <Button size="sm" variant="ghost" onClick={onHold}>
                  Hold
                </Button>
                {item.invoiceId && (
                  <Link
                    to={`/payments/new?invoice=${item.invoiceId}`}
                    className="text-12 text-text-secondary underline underline-offset-2 hover:text-text-primary"
                  >
                    View invoice
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
