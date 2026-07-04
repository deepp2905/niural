import { useState } from 'react';
import type { BulkItem, Contractor } from '../../lib/types';
import { formatUSD } from '../../lib/format';
import { ContractorAvatar } from '../../components/ContractorAvatar';
import { CheckIcon } from '../../components/ui/Icon';
import { cn } from '../../lib/cn';

/** A clean payout row (§7C). Compact by default; expanding shows the same
 *  evidence structure as a flagged row — trust must be inspectable. */
export function CleanRow({
  item,
  contractor,
  held,
  onToggleHold,
}: {
  item: BulkItem;
  contractor: Contractor;
  held: boolean;
  onToggleHold: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('border-b border-border-subtle last:border-b-0', held && 'opacity-50')}>
      <div className="flex items-center gap-3 px-4 py-3">
        <ContractorAvatar contractor={contractor} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-13 text-text-primary">{contractor.name}</span>
            <span className="money text-12 text-text-tertiary">{formatUSD(item.amountUsd)}</span>
          </div>
          <p className="truncate text-12 text-text-tertiary">{item.reason}</p>
        </div>
        <span className="hidden items-center gap-1 text-11 text-success sm:inline-flex">
          <CheckIcon size={13} /> clean
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-12 text-text-secondary underline underline-offset-2 hover:text-text-primary"
        >
          {open ? 'Hide' : 'Verify one'}
        </button>
        <button
          type="button"
          onClick={onToggleHold}
          className="text-12 text-text-tertiary underline underline-offset-2 hover:text-text-primary"
        >
          {held ? 'Include' : 'Hold'}
        </button>
      </div>
      {open && (
        <ul className="space-y-1 border-l-2 border-border-subtle px-4 pb-3 pl-11">
          {item.evidence.map((e, i) => (
            <li key={i} className="text-12 text-text-secondary">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
