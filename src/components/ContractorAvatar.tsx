import type { Contractor } from '../lib/types';
import { cn } from '../lib/cn';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/** Contractor avatar: initials disc with a small country-code badge. (Emoji
 *  flags render as raw letters on Windows, so we set the code deliberately.) */
export function ContractorAvatar({
  contractor,
  size = 'md',
  className,
}: {
  contractor: Contractor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims =
    size === 'sm' ? 'h-7 w-7 text-11' : size === 'lg' ? 'h-11 w-11 text-14' : 'h-9 w-9 text-12';
  const showBadge = size !== 'sm';

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn('grid place-items-center rounded-full bg-sunken font-600 text-text-secondary', dims)}
      >
        {initials(contractor.name)}
      </span>
      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 rounded-full border border-page bg-raised px-1 text-[9px] font-600 uppercase leading-[1.4] tracking-wide text-text-tertiary shadow-raised"
          aria-label={contractor.country}
          title={contractor.country}
        >
          {contractor.countryCode}
        </span>
      )}
    </span>
  );
}
