import { useStore } from '../lib/store';
import { WALLET, WALLET_LOW_BALANCE } from '../lib/mock';
import { formatUSD } from '../lib/format';

/** Full wallet balance card (§3C). Earns yield, shows MTD gain, and carries a
 *  discreet scenario switch to demo the §6b low-balance state. */
export function WalletBalanceCard() {
  const low = useStore((s) => s.lowBalanceScenario);
  const setLow = useStore((s) => s.setLowBalanceScenario);
  const balance = low ? WALLET_LOW_BALANCE : WALLET.balanceUsd;

  return (
    <div className="rounded-xl border border-border-subtle bg-raised p-5">
      <p className="text-12 text-text-tertiary">USD balance</p>
      <p className="money mt-1 text-24 font-500 text-text-money">{formatUSD(balance)}</p>
      <div className="mt-3 flex items-center gap-2 text-12">
        <span className="inline-flex items-center gap-1 rounded-full bg-success-surface px-2 py-0.5 text-success">
          earning {WALLET.apy}% APY
        </span>
        <span className="money text-text-secondary">{formatUSD(WALLET.mtdYieldUsd, { signed: true })} this month</span>
      </div>
      <div className="mt-4 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={() => setLow(!low)}
          className="text-11 text-text-tertiary underline underline-offset-2 hover:text-text-secondary"
        >
          {low ? 'Restore full balance' : 'Simulate low balance (demo)'}
        </button>
      </div>
    </div>
  );
}
