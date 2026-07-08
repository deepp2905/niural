import type { ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/cn';

/** Lightweight tooltip. Wrap the app once in TooltipProvider (done in shells). */
export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode;
  children: ReactNode;
  side?: RadixTooltip.TooltipContentProps['side'];
}) {
  return (
    <RadixTooltip.Root delayDuration={200}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={5}
          className={cn(
            'z-50 max-w-[220px] rounded-md bg-inverse px-2.5 py-1.5 text-12 text-text-inverse shadow-popover',
            'popover-motion',
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-[var(--surface-inverse)]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export const TooltipProvider = RadixTooltip.Provider;
