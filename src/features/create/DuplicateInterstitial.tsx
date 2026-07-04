import { useNavigate } from 'react-router-dom';
import type { Invoice } from '../../lib/types';
import { getContractor, getInvoice } from '../../lib/mock';
import { formatUSD, formatDateShort } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { AlertTriangleIcon } from '../../components/ui/Icon';

/** Blocking interstitial shown before the form when an invoice looks like a
 *  duplicate (§4b). Continuing records a persistent acknowledgement. */
export function DuplicateInterstitial({
  invoice,
  onContinue,
}: {
  invoice: Invoice;
  onContinue: () => void;
}) {
  const navigate = useNavigate();
  const original = invoice.duplicateOfInvoiceId ? getInvoice(invoice.duplicateOfInvoiceId) : undefined;
  const contractor = getContractor(invoice.contractorId);
  const amount = invoice.fields.amountUsd.value;

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-xl border border-border-subtle bg-raised p-6 shadow-raised">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warn-surface text-warn">
            <AlertTriangleIcon size={16} />
          </span>
          <h1 className="text-16 font-600 text-text-primary">This looks like a duplicate</h1>
        </div>

        <p className="mt-3 text-13 leading-relaxed text-text-secondary">
          Invoice <span className="font-500 text-text-primary">{invoice.number}</span> matches{' '}
          {original ? (
            <>
              invoice <span className="font-500 text-text-primary">{original.number}</span>, already
              paid {original.fields.dueDate.value ? formatDateShort(original.fields.dueDate.value) : ''} (
              <span className="money">{formatUSD(amount)}</span> to {contractor?.name}). Same
              contractor, amount, and period.
            </>
          ) : (
            <>a payout already sent for this contractor and period.</>
          )}
        </p>

        <div className="mt-4 rounded-lg bg-sunken p-3 text-12 text-text-secondary">
          <div className="flex justify-between">
            <span>Original</span>
            <span className="money text-text-primary">
              {original?.number} · {formatUSD(amount)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>This invoice</span>
            <span className="money text-text-primary">
              {invoice.number} · {formatUSD(amount)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            disabled={!invoice.duplicateOfPayoutId}
            onClick={() =>
              invoice.duplicateOfPayoutId && navigate(`/payments/status/${invoice.duplicateOfPayoutId}`)
            }
          >
            View original payout
          </Button>
          <Button size="lg" className="flex-1" onClick={onContinue}>
            It's not a duplicate — continue
          </Button>
        </div>
      </div>
    </div>
  );
}
