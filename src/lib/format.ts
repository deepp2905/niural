/*
 * Formatting helpers. All money rendering routes through here so grouping,
 * symbols, and decimal rules live in one place (§0). Indian digit grouping
 * is implemented by hand and unit-tested (§5, format.test.ts).
 */

import type { CurrencyCode, PayBasis } from './types';

interface CurrencyConfig {
  symbol: string;
  /** Symbol goes before the number (true) or as a trailing code (false). */
  prefix: boolean;
  /** Default fraction digits for a "clean" display. */
  decimals: number;
  /** Use Indian 2,2,3 grouping instead of Western 3,3,3. */
  indianGrouping: boolean;
  /** Trailing code appended after the amount, e.g. "USD". */
  code: string;
}

const CURRENCY: Record<CurrencyCode, CurrencyConfig> = {
  USD: { symbol: '$', prefix: true, decimals: 2, indianGrouping: false, code: 'USD' },
  INR: { symbol: '₹', prefix: true, decimals: 2, indianGrouping: true, code: 'INR' },
  PHP: { symbol: '₱', prefix: true, decimals: 2, indianGrouping: false, code: 'PHP' },
  PLN: { symbol: 'zł', prefix: false, decimals: 2, indianGrouping: false, code: 'PLN' },
  COP: { symbol: '$', prefix: true, decimals: 2, indianGrouping: false, code: 'COP' },
  NGN: { symbol: '₦', prefix: true, decimals: 2, indianGrouping: false, code: 'NGN' },
  USDC: { symbol: '', prefix: false, decimals: 2, indianGrouping: false, code: 'USDC' },
};

/** Group an integer string using Indian convention: last 3, then 2s. */
export function groupIndian(intDigits: string): string {
  const neg = intDigits.startsWith('-');
  const digits = neg ? intDigits.slice(1) : intDigits;
  if (digits.length <= 3) return (neg ? '-' : '') + digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg ? '-' : '') + grouped + ',' + last3;
}

/** Group an integer string using Western convention: groups of 3. */
export function groupWestern(intDigits: string): string {
  const neg = intDigits.startsWith('-');
  const digits = neg ? intDigits.slice(1) : intDigits;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + grouped;
}

interface FormatOptions {
  /** Override the currency's default decimal digits. */
  decimals?: number;
  /** Include the trailing currency code, e.g. "$1,200.00 USD". */
  withCode?: boolean;
  /** Render explicit + for positive values (deltas). */
  signed?: boolean;
}

function formatWithConfig(
  amount: number,
  cfg: CurrencyConfig,
  opts: FormatOptions = {},
): string {
  const decimals = opts.decimals ?? cfg.decimals;
  const neg = amount < 0;
  const abs = Math.abs(amount);
  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split('.');
  const grouped = cfg.indianGrouping ? groupIndian(intPart) : groupWestern(intPart);
  const number = fracPart ? `${grouped}.${fracPart}` : grouped;

  const sign = neg ? '-' : opts.signed ? '+' : '';
  let body = cfg.prefix
    ? `${cfg.symbol}${number}`
    : cfg.symbol
      ? `${number} ${cfg.symbol}`
      : number;
  body = `${sign}${body}`;
  if (opts.withCode || !cfg.prefix) {
    // Non-prefix currencies (USDC) always show the code for clarity.
    body = cfg.symbol && cfg.prefix ? `${body} ${cfg.code}` : `${body} ${cfg.code}`;
  }
  return body;
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  opts: FormatOptions = {},
): string {
  return formatWithConfig(amount, CURRENCY[currency], opts);
}

/** Convenience: Indian-grouped rupees, e.g. formatINR(99447.24) => "₹99,447.24". */
export function formatINR(amount: number, opts: FormatOptions = {}): string {
  return formatWithConfig(amount, CURRENCY.INR, opts);
}

/** USD helper, e.g. formatUSD(1204.99) => "$1,204.99". */
export function formatUSD(amount: number, opts: FormatOptions = {}): string {
  return formatWithConfig(amount, CURRENCY.USD, opts);
}

/** How a manual payout was denominated, e.g. "40 h × ₹2,500" or "Fixed ₹1,00,000". */
export function formatPayBasis(basis: PayBasis): string {
  const decimals = basis.currency === 'USDC' ? 2 : 0;
  if (basis.mode === 'fixed') {
    return `Fixed ${formatMoney(basis.localAmount, basis.currency, { decimals })}`;
  }
  const hours = Number.isInteger(basis.hours) ? String(basis.hours) : basis.hours.toFixed(1);
  return `${hours} h × ${formatMoney(basis.hourlyRate, basis.currency, { decimals })}`;
}

/** FX rate to 4 dp, e.g. formatRate(83.215) => "83.2150". */
export function formatRate(rate: number): string {
  return rate.toFixed(4);
}

/** mm:ss countdown from a seconds value, e.g. 900 => "15:00". */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Fri, Jul 10" from an ISO date. */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Jul 10, 2026" from an ISO date. */
export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** "Mar 2027" — month + year, for tax-form validity copy. */
export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
