import type { Invoice } from '../../lib/types';
import { getContractor } from '../../lib/mock';
import { formatUSD, formatDateLong } from '../../lib/format';
import { cn } from '../../lib/cn';

/** Fake PDF viewer — the mock invoice as styled HTML inside a document frame
 *  (§4b). `hoveredField` highlights the matching region for hover-linking. */
export function InvoiceDocument({
  invoice,
  hoveredField,
}: {
  invoice: Invoice;
  hoveredField: string | null;
}) {
  const contractor = getContractor(invoice.contractorId);
  const total = invoice.lineItems.reduce((s, li) => s + li.amountUsd, 0);

  return (
    <div className="rounded-lg border border-border-subtle bg-sunken p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-11 uppercase tracking-wide text-text-tertiary">Invoice {invoice.number}</span>
        <span className="text-11 text-text-tertiary">PDF · 1 page</span>
      </div>

      {/* Paper */}
      <div className="relative aspect-[1/1.3] w-full overflow-hidden rounded-md bg-white text-black shadow-raised">
        {/* Hover-link highlight overlays */}
        {invoice.regions.map((r) => (
          <div
            key={r.field}
            aria-hidden
            className={cn(
              'pointer-events-none absolute rounded-[3px] transition-opacity duration-150',
              hoveredField === r.field ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              top: `${r.rect.top}%`,
              left: `${r.rect.left}%`,
              width: `${r.rect.width}%`,
              height: `${r.rect.height}%`,
              background: 'rgba(124, 92, 252, 0.16)',
              boxShadow: '0 0 0 1.5px rgba(124, 92, 252, 0.6)',
            }}
          />
        ))}

        {/* Document content, laid out to sit under the coordinate map */}
        <div className="absolute inset-0 p-[6%] text-[clamp(9px,1.7vw,12px)] leading-relaxed">
          <div className="flex items-start justify-between">
            <div className="max-w-[55%]">
              <p className="font-semibold">{invoice.senderName}</p>
              <p className="text-[0.85em] text-neutral-500">{invoice.senderEmail}</p>
              <p className="mt-3 text-[0.85em] text-neutral-500">Bill to</p>
              <p className="font-medium">Paynetic Inc.</p>
            </div>
            <div className="text-right">
              <p className="text-[1.4em] font-bold tracking-tight">INVOICE</p>
              <p className="mt-1 text-[0.9em] text-neutral-600">{invoice.number}</p>
            </div>
          </div>

          <div className="mt-[8%] flex justify-between text-[0.9em]">
            <div>
              <p className="text-neutral-500">Issued</p>
              <p className="font-medium">{formatDateLong(invoice.issueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500">Due</p>
              <p className={cn('font-medium', invoice.fields.dueDate.value ? '' : 'text-neutral-400 blur-[1.5px]')}>
                {invoice.fields.dueDate.value ? formatDateLong(invoice.fields.dueDate.value) : 'Jul 15, 2026'}
              </p>
            </div>
          </div>

          <div className="mt-[9%] border-t border-neutral-200 pt-2">
            <div className="flex justify-between text-[0.8em] uppercase tracking-wide text-neutral-400">
              <span>Description</span>
              <span>Amount</span>
            </div>
            {invoice.lineItems.map((li, i) => (
              <div key={i} className="flex justify-between border-b border-neutral-100 py-1.5">
                <span>{li.description}</span>
                <span className="tabular-nums">{formatUSD(li.amountUsd)}</span>
              </div>
            ))}
          </div>

          <div className="mt-[4%] flex justify-end">
            <div className="w-[55%]">
              <div className="flex justify-between py-1 text-[0.9em] text-neutral-500">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatUSD(total)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-300 py-1.5 font-bold">
                <span>Total Due</span>
                <span className="tabular-nums">{formatUSD(total)}</span>
              </div>
            </div>
          </div>

          {contractor && (
            <p className="absolute bottom-[5%] left-[6%] text-[0.8em] text-neutral-400">
              Payable to {contractor.defaultMethod.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
