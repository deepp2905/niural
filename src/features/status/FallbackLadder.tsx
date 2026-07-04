import { useState } from 'react';
import type { Contractor } from '../../lib/types';
import { AgentCard } from '../../components/AgentCard';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

/** Corridor-aware fallback ladder shown on a failed payout (§6d). Ordered by
 *  what the agent recommends first; the explicitly-absent option (stablecoin)
 *  is shown with its reason — the point is the AI showing what it didn't pick. */
export function FallbackLadder({ contractor }: { contractor: Contractor }) {
  const first = contractor.name.split(' ')[0];
  const [showPreview, setShowPreview] = useState(false);
  const [notStablecoinOpen, setNotStablecoinOpen] = useState(false);

  return (
    <AgentCard title={`Here's how I'd recover this payout to ${first}`}>
      <ol className="space-y-2.5">
        {/* 1 — primary */}
        <li className="rounded-lg border border-border-subtle bg-raised p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-13 font-500 text-text-primary">
                1 · Re-verify account details with {first}
              </p>
              <p className="mt-0.5 text-12 text-text-secondary">
                Sends a secure re-verification link. Fastest path if the account is genuinely new.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? 'Hide message' : 'Review message'}
            </Button>
          </div>
          {showPreview && (
            <div className="mt-3 rounded-md border border-border-subtle bg-sunken p-3 text-12 text-text-secondary">
              <p className="text-11 uppercase tracking-wide text-text-tertiary">
                To {contractor.email}
              </p>
              <p className="mt-1.5 leading-relaxed">
                Hi {first}, a payout from Paynetic Inc. couldn't be delivered because your bank
                reported a name mismatch. Please re-confirm your account details using this secure
                link — it takes about a minute. Nothing is charged to you.
              </p>
              <div className="mt-3">
                <Button size="sm">Send secure re-verification link</Button>
              </div>
            </div>
          )}
        </li>

        {/* 2 */}
        <LadderStep
          n={2}
          title={`Retry via NEFT once verified`}
          detail="Switches rails to NEFT after the account clears — slower but avoids the rejecting path."
          action="Queue NEFT retry"
        />

        {/* 3 */}
        <LadderStep
          n={3}
          title={`Pay to ${first}'s Paynetic Wallet instead`}
          detail={`${first} can withdraw locally. Arrives instantly, no extra fee.`}
          action="Reroute to wallet"
        />

        {/* 4 — explicitly absent, with reason */}
        <li className="rounded-lg border border-dashed border-border-subtle bg-transparent">
          <button
            type="button"
            onClick={() => setNotStablecoinOpen((v) => !v)}
            aria-expanded={notStablecoinOpen}
            className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
          >
            <span className="text-12 text-text-tertiary">Why not stablecoin?</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              className={cn('text-text-tertiary transition-transform', notStablecoinOpen && 'rotate-180')}
              aria-hidden
            >
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {notStablecoinOpen && (
            <p className="px-3 pb-3 text-12 text-text-secondary">
              {first} hasn't opted into crypto payouts, and USDC receipts in India carry VDA tax
              treatment (30% + 1% TDS) for the recipient. I left it out on purpose.
            </p>
          )}
        </li>
      </ol>

      <p className="mt-3 border-t border-ai-border pt-3 text-12 text-text-secondary">
        Funds returned to your balance · no fees charged on failed payouts.
      </p>
    </AgentCard>
  );
}

function LadderStep({
  n,
  title,
  detail,
  action,
}: {
  n: number;
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <li className="rounded-lg border border-border-subtle bg-raised p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-13 font-500 text-text-primary">
            {n} · {title}
          </p>
          <p className="mt-0.5 text-12 text-text-secondary">{detail}</p>
        </div>
        <Button size="sm" variant="secondary">
          {action}
        </Button>
      </div>
    </li>
  );
}
