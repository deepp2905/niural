import type { ReactNode } from 'react';
import { SparkGlyph } from './ui/AIChip';
import { cn } from '../lib/cn';

/** Violet-marked agent container (§8d.5) — queue cards, fallback ladders. The
 *  violet mark is the agent's identity; the word "AI" stays in chips only. */
export function AgentCard({
  title,
  children,
  className,
  tone = 'ai',
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: 'ai' | 'neutral';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        tone === 'ai' ? 'border-ai-border bg-ai-surface' : 'border-border-subtle bg-raised',
        className,
      )}
    >
      {title && (
        <div className="mb-2.5 flex items-center gap-2">
          <SparkGlyph className="shrink-0 text-ai" />
          <p className="text-13 font-600 text-text-primary">{title}</p>
        </div>
      )}
      {children}
    </div>
  );
}
