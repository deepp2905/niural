import { cn } from '../lib/cn';

/** Small verified / unverified pill used on payment methods (§4a). */
export function VerificationBadge({
  verified,
  method,
  className,
}: {
  verified: boolean;
  method: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-500',
        verified ? 'bg-success-surface text-success' : 'bg-warn-surface text-warn',
        className,
      )}
      title={method}
    >
      {verified ? (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 2v4.5M6 9v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {verified ? 'verified' : 'unverified'}
    </span>
  );
}
