import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

/** Right-side drawer built on Radix Dialog (§8d). Used for recurring setup,
 *  policy view, run preview. Framer handles the slide; reduced-motion honored. */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] data-[state=open]:opacity-100" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full flex-col border-l border-border-subtle bg-page shadow-takeover',
              width === 'lg' ? 'w-full max-w-lg' : 'w-full max-w-md',
            )}
          >
            <div className="flex items-start justify-between border-b border-border-subtle px-5 py-4">
              <div>
                <Dialog.Title className="text-16 font-600 text-text-primary">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-0.5 text-13 text-text-secondary">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                className="grid h-7 w-7 place-items-center rounded-md text-text-tertiary hover:bg-sunken hover:text-text-primary"
                aria-label="Close"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">{children}</div>

            {footer && <div className="border-t border-border-subtle px-5 py-4">{footer}</div>}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
