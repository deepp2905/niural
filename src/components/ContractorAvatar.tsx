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

export function ContractorAvatar({
  contractor,
  size = 'md',
  className,
}: {
  contractor: Contractor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-11 w-11 text-14' : 'h-8 w-8 text-12';
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-full bg-sunken font-600 text-text-secondary',
          dims,
        )}
      >
        {initials(contractor.name)}
      </span>
      <span
        className="absolute -bottom-0.5 -right-0.5 text-[11px] leading-none"
        aria-label={contractor.country}
        title={contractor.country}
      >
        {contractor.flag}
      </span>
    </span>
  );
}
