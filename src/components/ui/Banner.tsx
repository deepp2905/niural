import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BannerTone = 'info' | 'warn' | 'danger' | 'success' | 'neutral';

const TONE: Record<BannerTone, string> = {
  info: 'border-border-subtle bg-info-surface text-text-primary',
  warn: 'border-border-subtle bg-warn-surface text-text-primary',
  danger: 'border-border-subtle bg-danger-surface text-text-primary',
  success: 'border-border-subtle bg-success-surface text-text-primary',
  neutral: 'border-border-subtle bg-sunken text-text-primary',
};

const ICON_COLOR: Record<BannerTone, string> = {
  info: 'text-info',
  warn: 'text-warn',
  danger: 'text-danger',
  success: 'text-success',
  neutral: 'text-text-tertiary',
};

export function Banner({
  tone = 'neutral',
  icon,
  title,
  children,
  actions,
  className,
}: {
  tone?: BannerTone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border px-4 py-3', TONE[tone], className)} role="status">
      <div className="flex gap-3">
        {icon && <span className={cn('mt-0.5 shrink-0', ICON_COLOR[tone])}>{icon}</span>}
        <div className="min-w-0 flex-1">
          {title && <p className="text-13 font-600 text-text-primary">{title}</p>}
          {children && <div className="mt-0.5 text-13 text-text-secondary">{children}</div>}
          {actions && <div className="mt-2.5 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
