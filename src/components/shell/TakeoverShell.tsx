import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { ArrowLeftIcon, CheckIcon } from '../ui/Icon';
import { useStore } from '../../lib/store';
import { cn } from '../../lib/cn';

const STEPS = ['Details', 'Review', 'Sent'] as const;

function activeStep(pathname: string): number {
  if (pathname.startsWith('/payments/review')) return 1;
  if (pathname.startsWith('/payments/status')) return 2;
  return 0; // /payments/new
}

/** Slim header used across the create → review → sent takeover (§2). The full
 *  app shell collapses so the flow reads as a single focused task. */
export function TakeoverShell() {
  const { pathname } = useLocation();
  const step = activeStep(pathname);
  // Dark mode is scoped to the review screen (§5); theme the whole takeover so
  // the header doesn't leave a light seam above dark content.
  const reviewDark = useStore((s) => s.reviewDark);
  const dark = reviewDark && pathname.startsWith('/payments/review');

  return (
    <div data-theme={dark ? 'dark' : undefined} className="min-h-screen bg-page text-text-primary">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border-subtle bg-page/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/payments"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-13 text-text-secondary hover:bg-sunken hover:text-text-primary"
          >
            <ArrowLeftIcon size={14} />
            Back to payments
          </Link>
        </div>

        {/* Step indicator */}
        <ol className="hidden items-center gap-2 sm:flex" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1.5 text-12',
                  i === step ? 'font-600 text-text-primary' : 'text-text-tertiary',
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'grid h-4 w-4 place-items-center rounded-full text-[10px] font-600',
                    i < step && 'bg-success text-text-inverse',
                    i === step && 'bg-action-primary text-text-inverse',
                    i > step && 'border border-border-strong text-text-tertiary',
                  )}
                >
                  {i < step ? <CheckIcon size={11} /> : i + 1}
                </span>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border-subtle" aria-hidden />}
            </li>
          ))}
        </ol>

        <div className="opacity-90">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
