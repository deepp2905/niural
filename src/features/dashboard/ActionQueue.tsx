import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover } from '../../components/ui/Popover';
import { AgentCard } from '../../components/AgentCard';
import { Button, buttonClasses } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { formatUSD } from '../../lib/format';

interface QueueCard {
  id: string;
  body: React.ReactNode;
  cta: string;
  to?: string;
  onClick?: () => void;
  why: string;
}

/** Agent-voiced action queue (§3A). Each card explains its own trigger. */
export function ActionQueue() {
  const [runOpen, setRunOpen] = useState(false);

  const cards: QueueCard[] = [
    {
      id: 'invoices',
      body: (
        <>
          <span className="font-600 text-text-primary">3 invoices</span> awaiting payment ·{' '}
          <span className="money">{formatUSD(4850)}</span> total
        </>
      ),
      cta: 'Review & pay',
      to: '/payments/bulk',
      why: 'Three invoices arrived at invoices@paynetic.com this week and matched contractor records. I grouped them for one review.',
    },
    {
      id: 'priya',
      body: (
        <>
          <span className="font-600 text-text-primary">Priya Sharma's</span> June invoice arrived
          Tuesday
        </>
      ),
      cta: 'Review',
      to: '/payments/new?invoice=inv_006',
      why: 'Invoice received at invoices@paynetic.com, matched to Priya Sharma by sender email and 3 prior invoices of the same amount.',
    },
    {
      id: 'run',
      body: (
        <>
          Monthly run for <span className="font-600 text-text-primary">4 contractors</span>{' '}
          scheduled Jul 28 · needs approval by Jul 24
        </>
      ),
      cta: 'Preview run',
      onClick: () => setRunOpen(true),
      why: 'A recurring monthly run is configured for 4 contractors. It needs approval 4 days before the send date to guarantee arrival by the 1st.',
    },
  ];

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <AgentCard key={card.id} className="flex flex-col justify-between">
            <p className="text-13 leading-snug text-text-secondary">{card.body}</p>
            <div className="mt-3 flex items-center justify-between">
              {card.to ? (
                <Link to={card.to} className={buttonClasses('primary', 'sm')}>
                  {card.cta}
                </Link>
              ) : (
                <Button size="sm" onClick={card.onClick}>
                  {card.cta}
                </Button>
              )}
              <Popover
                align="end"
                trigger={
                  <button
                    type="button"
                    className="text-11 text-text-tertiary underline underline-offset-2 hover:text-text-secondary"
                  >
                    Why am I seeing this?
                  </button>
                }
              >
                <p className="text-13 text-text-secondary">{card.why}</p>
              </Popover>
            </div>
          </AgentCard>
        ))}
      </div>

      {/* Read-only run preview (§3A card 3) */}
      <Drawer open={runOpen} onOpenChange={setRunOpen} title="Monthly run preview" description="Scheduled Jul 28 · read-only">
        <div className="space-y-3">
          <p className="text-13 text-text-secondary">
            This recurring run sends 4 payouts 3 days before month-end. Scheduling is a concept in
            this prototype — the preview is read-only.
          </p>
          {[
            { name: 'Priya Sharma', amt: 1200 },
            { name: 'Mateo Aguirre', amt: 2000 },
            { name: 'Sofia Marin', amt: 900 },
            { name: 'Amara Okafor', amt: 750 },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-lg border border-border-subtle bg-raised px-3 py-2.5 text-13">
              <span className="text-text-primary">{r.name}</span>
              <span className="money text-text-secondary">{formatUSD(r.amt)}</span>
            </div>
          ))}
          <p className="text-12 text-text-tertiary">Needs approval by Jul 24 to arrive by Aug 1.</p>
        </div>
      </Drawer>
    </>
  );
}
