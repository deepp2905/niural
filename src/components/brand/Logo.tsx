import { cn } from '../../lib/cn';

/** Paynetic wordmark. Neutral by design — violet is reserved for AI (§8a). */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="grid h-6 w-6 place-items-center rounded-md bg-action-primary text-text-inverse"
        aria-hidden
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 13V3h5.2a3.4 3.4 0 0 1 0 6.8H6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-14 font-600 tracking-tight text-text-primary">Paynetic</span>
    </div>
  );
}
