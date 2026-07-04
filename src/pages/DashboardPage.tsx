import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/Button';
import { WalletBalanceCard } from '../components/WalletBalanceCard';
import { ActionQueue } from '../features/dashboard/ActionQueue';
import { PayoutsTable } from '../features/dashboard/PayoutsTable';

/** Payout dashboard (§3): agent action queue, payouts table, wallet card. */
export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-24 font-600 tracking-tight text-text-primary">Payments</h1>
          <p className="mt-1 text-13 text-text-secondary">
            Create and track global contractor payouts.
          </p>
        </div>
        <Link to="/payments/new" className={buttonClasses('primary', 'md')}>
          New payout
        </Link>
      </div>

      {/* Action queue */}
      <section className="space-y-3">
        <h2 className="text-13 font-600 text-text-primary">For your attention</h2>
        <ActionQueue />
      </section>

      {/* Table + wallet */}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <section className="space-y-3">
          <h2 className="text-13 font-600 text-text-primary">Payouts</h2>
          <PayoutsTable />
        </section>
        <aside className="space-y-4">
          <WalletBalanceCard />
        </aside>
      </div>
    </div>
  );
}
