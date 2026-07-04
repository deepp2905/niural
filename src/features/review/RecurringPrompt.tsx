import { useState } from 'react';
import type { Contractor } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { SparkGlyph } from '../../components/ui/AIChip';
import { formatUSD } from '../../lib/format';

/** Contextual, dismissible recurring prompt (§5E) — an inline card, never a
 *  modal. "Set up recurring" opens the arrival back-computation drawer. */
export function RecurringPrompt({
  contractor,
  amountUsd,
  count,
  onDismiss,
}: {
  contractor: Contractor;
  amountUsd: number;
  count: number;
  onDismiss: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const first = contractor.name.split(' ')[0];
  const ordinal = count; // identical payouts already on record (Priya: 3)

  return (
    <>
      <div className="rounded-xl border border-ai-border bg-ai-surface p-4">
        <div className="flex items-start gap-2.5">
          <SparkGlyph className="mt-0.5 shrink-0 text-ai" />
          <div className="flex-1">
            <p className="text-13 text-text-primary">
              This is the {ordinalWord(ordinal)} identical monthly payout of{' '}
              <span className="money">{formatUSD(amountUsd)}</span> to {first}. Make it recurring?
            </p>
            <p className="mt-1 text-12 text-text-secondary">
              I'd schedule the send 3 days before month-end so it always arrives by the 1st,
              adjusted for bank holidays.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => setDrawerOpen(true)}>
                Set up recurring
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Recurring monthly payout"
        description={`${formatUSD(amountUsd)} to ${contractor.name}, every month`}
        footer={
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
              Schedule recurring payout
            </Button>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <ArrivalBackComputation />
      </Drawer>
    </>
  );
}

/** Static-but-designed arrival ↔ send-date visual with a bank holiday pushing
 *  the send date earlier (§5E, concept fidelity). */
function ArrivalBackComputation() {
  return (
    <div className="space-y-5">
      <p className="text-13 text-text-secondary">
        We work backwards from the arrival date. The payout must land by the 1st, so we send 1
        business day earlier — and skip bank holidays.
      </p>

      <div className="rounded-lg border border-border-subtle bg-raised p-4">
        <p className="mb-3 text-11 uppercase tracking-wide text-text-tertiary">Late July → Aug 1</p>
        <CalendarStrip />
        <div className="mt-4 space-y-2 text-12">
          <Legend swatch="bg-action-primary" label="Send date — Jul 30 (moved earlier)" />
          <Legend swatch="bg-danger" label="Bank holiday — Jul 31 (would delay arrival)" />
          <Legend swatch="bg-success" label="Arrival — Aug 1, guaranteed" />
        </div>
      </div>

      <p className="text-12 text-text-tertiary">
        Because Jul 31 is a bank holiday in India, we move the send to Jul 30 so the money still
        arrives on the 1st. This adjusts automatically each month.
      </p>
    </div>
  );
}

function CalendarStrip() {
  const days = [
    { d: 28, tone: '' },
    { d: 29, tone: '' },
    { d: 30, tone: 'send' },
    { d: 31, tone: 'holiday' },
    { d: 1, tone: 'arrive', month: 'Aug' },
  ];
  return (
    <div className="flex gap-1.5">
      {days.map((day) => (
        <div
          key={`${day.month ?? 'Jul'}-${day.d}`}
          className={
            'flex flex-1 flex-col items-center rounded-md border px-1 py-2 ' +
            (day.tone === 'send'
              ? 'border-action-primary bg-action-primary text-text-inverse'
              : day.tone === 'holiday'
                ? 'border-border-subtle bg-danger-surface text-danger'
                : day.tone === 'arrive'
                  ? 'border-border-subtle bg-success-surface text-success'
                  : 'border-border-subtle bg-sunken text-text-tertiary')
          }
        >
          <span className="text-[10px] uppercase">{day.month ?? 'Jul'}</span>
          <span className="money text-14 font-500">{day.d}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </div>
  );
}

function ordinalWord(n: number): string {
  const words = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'];
  return words[n] ?? `${n}th`;
}
