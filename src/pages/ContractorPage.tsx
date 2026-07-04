import { Link, useParams } from 'react-router-dom';
import { getPayout } from '../lib/mock';

export function ContractorPage() {
  const { payoutId } = useParams();
  const payout = payoutId ? getPayout(payoutId) : undefined;
  return (
    <div className="min-h-screen bg-sunken px-4 py-10">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-border-subtle bg-raised shadow-takeover">
        <div className="border-b border-border-subtle px-5 py-4">
          <p className="text-12 text-text-tertiary">Paynetic · Remittance</p>
        </div>
        <div className="space-y-2 px-5 py-6 text-13 text-text-secondary">
          <p className="text-14 font-600 text-text-primary">Contractor remittance view</p>
          <p>Phase 5 · §6f — recipient emphasis on the same settlement object.</p>
          <p>
            Payout <span className="money">{payoutId}</span>
            {payout ? ` — ${payout.status}.` : ' — no matching mock payout.'}
          </p>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link to="/payments" className="text-12 text-text-tertiary underline underline-offset-2">
          ← Back to admin app
        </Link>
      </div>
    </div>
  );
}
