import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  // Primary is near-black, never violet — violet is AI-only (§8a).
  primary:
    'bg-action-primary text-text-inverse hover:bg-action-primary-hover disabled:bg-border-strong disabled:text-text-tertiary',
  secondary:
    'border border-border-strong bg-raised text-text-primary hover:bg-sunken disabled:text-text-tertiary',
  ghost: 'text-text-secondary hover:bg-sunken hover:text-text-primary disabled:text-text-tertiary',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-13 rounded-md gap-1.5',
  md: 'h-9 px-3.5 text-13 rounded-md gap-2',
  lg: 'h-11 px-5 text-14 rounded-md gap-2',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    'inline-flex items-center justify-center font-500 transition-colors select-none',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(buttonClasses(variant, size), className)} {...props} />
  );
});
