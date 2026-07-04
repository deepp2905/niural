import { useEffect, useRef, useState } from 'react';

export interface Countdown {
  /** Seconds remaining. */
  remaining: number;
  expired: boolean;
  /** Fraction elapsed 0→1 (for progress rings). */
  progress: number;
  reset: (seconds?: number) => void;
}

/** A one-shot countdown timer (rate lock, cancel window). Ticks each second;
 *  cheap enough to run per-screen. Not gated on reduced-motion because it's an
 *  information display, not decoration. */
export function useCountdown(initialSeconds: number, running = true): Countdown {
  const [total, setTotal] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setRemaining(Math.max(0, total - elapsed));
    };
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [total, running]);

  const reset = (seconds?: number) => {
    const next = seconds ?? initialSeconds;
    startRef.current = Date.now();
    setTotal(next);
    setRemaining(next);
  };

  return {
    remaining,
    expired: remaining <= 0,
    progress: total > 0 ? Math.min(1, (total - remaining) / total) : 1,
    reset,
  };
}
