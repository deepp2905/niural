import clsx, { type ClassValue } from 'clsx';

/** Thin class-name joiner. (No tailwind-merge — token classes don't collide.) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
