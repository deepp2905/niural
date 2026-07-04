import type { TimelineEvent } from '../../lib/types';
import { cn } from '../../lib/cn';

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hh = d.getUTCHours();
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'pm' : 'am';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${h12}:${mm}${ampm}`;
}

/** Vertical payout status timeline (§6a). Reached events are solid; the first
 *  unreached is "next"; a failed event shows red. */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  const firstPendingIdx = events.findIndex((e) => !e.at && !e.failed);

  return (
    <ol className="relative">
      {events.map((e, i) => {
        const done = !!e.at && !e.failed;
        const failed = !!e.failed;
        const isNext = i === firstPendingIdx;
        const last = i === events.length - 1;
        return (
          <li key={e.key} className="relative flex gap-3 pb-5 last:pb-0">
            {/* connector */}
            {!last && (
              <span
                className={cn(
                  'absolute left-[7px] top-4 h-full w-px',
                  done ? 'bg-success' : 'bg-border-subtle',
                )}
                aria-hidden
              />
            )}
            {/* node */}
            <span
              className={cn(
                'relative z-10 mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full',
                done && 'bg-success',
                failed && 'bg-danger',
                !done && !failed && (isNext ? 'border-2 border-info bg-page' : 'border-2 border-border-strong bg-page'),
              )}
              aria-hidden
            >
              {done && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2 5 8.5l4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {failed && <span className="text-[9px] font-bold leading-none text-white">!</span>}
            </span>
            {/* content */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-13',
                  failed ? 'font-500 text-danger' : done ? 'text-text-primary' : isNext ? 'text-text-primary' : 'text-text-tertiary',
                )}
              >
                {e.label}
              </p>
              {e.at && <p className="money text-11 text-text-tertiary">{timeLabel(e.at)}</p>}
              {isNext && !e.at && <p className="text-11 text-info">In progress</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
