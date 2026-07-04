import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { WalletChip } from '../WalletChip';
import { cn } from '../../lib/cn';

interface NavItem {
  label: string;
  to?: string;
  icon: JSX.Element;
  disabled?: boolean;
}

const icon = (path: string) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d={path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV: NavItem[] = [
  { label: 'Home', icon: icon('M2.5 7 8 2.5 13.5 7v6.5h-4V9.5h-3v4h-4z'), disabled: true },
  { label: 'Payments', to: '/payments', icon: icon('M2 4.5h12M2 8h12M2 11.5h7') },
  { label: 'People', icon: icon('M5.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2 13c0-2 1.6-3.2 3.5-3.2S9 11 9 13M11 7.2a1.8 1.8 0 1 0 0-3.6M11.5 9.8c1.6.1 2.9 1.2 2.9 3.2'), disabled: true },
  { label: 'Reports', icon: icon('M3 13V3M3 13h10M6 10V7M9 10V5M12 10V8'), disabled: true },
  { label: 'Settings', icon: icon('M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M13 8a5 5 0 0 0-.1-1l1.1-.9-1-1.7-1.3.5a5 5 0 0 0-1.7-1L9.8 2.4H7.8L7.6 3.9a5 5 0 0 0-1.7 1l-1.3-.5-1 1.7L4.7 7a5 5 0 0 0 0 2l-1.1.9 1 1.7 1.3-.5a5 5 0 0 0 1.7 1l.2 1.5h2l.2-1.5a5 5 0 0 0 1.7-1l1.3.5 1-1.7-1.1-.9c.1-.3.1-.6.1-1Z'), disabled: true },
];

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-page text-text-primary">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border-subtle bg-raised px-3 py-4 md:flex">
        <div className="px-2 pb-6">
          <Logo />
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) =>
            item.disabled ? (
              <span
                key={item.label}
                title="Out of scope for this prototype"
                aria-disabled
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-13 text-text-tertiary opacity-60"
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <NavLink
                key={item.label}
                to={item.to!}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-13 font-500 transition-colors',
                    isActive || location.pathname.startsWith('/payments')
                      ? 'bg-sunken text-text-primary'
                      : 'text-text-secondary hover:bg-sunken',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="mt-auto px-2 pt-4">
          <NavLink
            to="/system"
            className="text-12 text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
          >
            Design system
          </NavLink>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border-subtle bg-page/90 px-6 backdrop-blur">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden text-13 text-text-secondary md:block">Payments</div>
          <div className="flex items-center gap-3">
            <WalletChip />
            <div
              className="grid h-8 w-8 place-items-center rounded-full bg-sunken text-12 font-600 text-text-secondary"
              title="Maya Chen · Finance admin"
            >
              MC
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
