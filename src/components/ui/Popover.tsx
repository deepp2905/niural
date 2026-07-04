import type { ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '../../lib/cn';

/** Headless Radix popover with our surface styling. Used for provenance,
 *  rate-lock explainer, expandable evidence, etc. */
export function Popover({
  trigger,
  children,
  className,
  align = 'start',
  side = 'bottom',
}: {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: RadixPopover.PopoverContentProps['align'];
  side?: RadixPopover.PopoverContentProps['side'];
}) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          side={side}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'z-50 max-w-xs rounded-lg border border-border-subtle bg-raised p-3 text-13 text-text-secondary shadow-popover',
            'popover-motion focus:outline-none',
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
