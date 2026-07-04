import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Circular progress ring for the cancel window (§6a). `progress` is 0→1. */
export function ProgressRing({
  progress,
  size = 18,
  stroke = 2,
  className,
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * Math.min(1, Math.max(0, progress));
  return (
    <span className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
        />
      </svg>
      {children && <span className="absolute">{children}</span>}
    </span>
  );
}
