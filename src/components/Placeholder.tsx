import type { ReactNode } from 'react';

/** Phase-1 placeholder scaffold. Each screen renders its identity + the phase
 *  that fills it in, so the routing skeleton is legible while unbuilt. */
export function Placeholder({
  title,
  phase,
  children,
}: {
  title: string;
  phase: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-20 font-600 text-text-primary">{title}</h1>
        <span className="rounded-full bg-sunken px-2 py-0.5 text-12 text-text-tertiary">
          {phase}
        </span>
      </div>
      <div className="rounded-lg border border-dashed border-border-strong bg-raised p-6 text-13 text-text-secondary">
        {children ?? 'This screen is part of the routing skeleton and is built in a later phase.'}
      </div>
    </div>
  );
}
