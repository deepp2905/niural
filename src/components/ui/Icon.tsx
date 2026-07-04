import type { SVGProps } from 'react';

/*
 * A small, consistent stroke-icon set. One visual language — 16px grid, 1.5
 * stroke, round joins — so nothing in the product falls back to an emoji glyph
 * (which reads as unfinished and renders inconsistently across platforms).
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

function base({ size = 16, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 2.75 14.25 13.25H1.75z" />
      <path d="M8 6.5v3" />
      <circle cx="8" cy="11.2" r="0.35" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Blocked / hard-stop — a circle with a slash. */
export function BlockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M4.4 4.4 11.6 11.6" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.2v3.4" />
      <circle cx="8" cy="5.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8h9" />
      <path d="M8.5 4.5 12 8l-3.5 3.5" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 8H4" />
      <path d="M7.5 4.5 4 8l3.5 3.5" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3.2l2 1.3" />
    </svg>
  );
}
