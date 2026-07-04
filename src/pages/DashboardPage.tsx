import { Link } from 'react-router-dom';
import { Placeholder } from '../components/Placeholder';

/**
 * Phase-1 dashboard stub. The real queue + table + wallet card land in Phase 1's
 * later screens; for now this is the reachability hub so every route in §2 can
 * be navigated to during review. Replaced by the full §3 spec in a later pass.
 */
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-24 font-600 tracking-tight text-text-primary">Payments</h1>
          <p className="mt-1 text-13 text-text-secondary">
            Create and track global contractor payouts.
          </p>
        </div>
        <Link
          to="/payments/new"
          className="rounded-md bg-action-primary px-3.5 py-2 text-13 font-500 text-text-inverse transition-colors hover:bg-action-primary-hover"
        >
          New payout
        </Link>
      </div>

      <div className="rounded-lg border border-dashed border-border-strong bg-raised p-5">
        <p className="text-13 font-500 text-text-primary">Routing skeleton — reachability check</p>
        <p className="mt-1 text-12 text-text-tertiary">
          Every screen in the IA is linked below. These become real flows across Phases 2–7.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { to: '/payments/new', label: 'Create payout — manual (§4a, Phase 2)' },
            { to: '/payments/new?invoice=inv_006', label: 'Create payout — invoice (§4b, Phase 3)' },
            { to: '/payments/review/draft_demo', label: 'Review & confirm (§5, Phase 4)' },
            { to: '/payments/status/pay_002', label: 'Status — paid (§6a, Phase 5)' },
            { to: '/payments/status/pay_009', label: 'Status — failed + fallback (§6d, Phase 5)' },
            { to: '/payments/bulk', label: 'Bulk approval (§7, Phase 6)' },
            { to: '/contractor/pay_002', label: 'Contractor view (§6f, Phase 5)' },
            { to: '/system', label: 'Design system reference (§8f, Phase 7)' },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md border border-border-subtle bg-page px-3 py-2 text-13 text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <Placeholder title="Action queue + payouts table" phase="Phase 1 · §3">
        Agent-voiced action queue, payouts table, and wallet balance card render here per §3.
      </Placeholder>
    </div>
  );
}
