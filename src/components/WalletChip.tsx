import { useStore } from '../lib/store';
import { WALLET, WALLET_LOW_BALANCE } from '../lib/mock';
import { formatUSD } from '../lib/format';
import { cn } from '../lib/cn';

/** Compact wallet balance chip for the top bar (§2). Reflects the low-balance
 *  scenario flag so the whole app shares one balance source. */
export function WalletChip({ className }: { className?: string }) {
  const low = useStore((s) => s.lowBalanceScenario);
  const balance = low ? WALLET_LOW_BALANCE : WALLET.balanceUsd;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border border-border-subtle bg-raised px-3 py-1.5',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      <span className="money text-13 font-500 text-text-money">{formatUSD(balance)}</span>
      <span className="text-12 text-text-tertiary">· {WALLET.apy}% APY</span>
    </div>
  );
}
