import { Link, useParams } from 'react-router-dom';
import { Placeholder } from '../components/Placeholder';
import { getPayout } from '../lib/mock';

export function StatusPage() {
  const { payoutId } = useParams();
  const payout = payoutId ? getPayout(payoutId) : undefined;
  return (
    <Placeholder title="Payout status & tracking" phase="Phase 5 · §6a–e">
      <div className="space-y-2">
        <p>
          Status timeline, cancel-window countdown, and (on failure) the fallback ladder for{' '}
          <span className="money">{payoutId}</span>
          {payout ? ` — currently ${payout.status}.` : ' — no matching mock payout.'}
        </p>
        {payoutId && (
          <Link to={`/contractor/${payoutId}`} className="text-13 text-info underline underline-offset-2">
            Contractor view →
          </Link>
        )}
      </div>
    </Placeholder>
  );
}
