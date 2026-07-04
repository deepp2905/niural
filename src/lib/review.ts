/*
 * Review-screen resolver (§5). Turns a Draft into the concrete objects the
 * hero screen renders: contractor, method, rates, arrival, and the checks
 * strip. Settlement itself is computed reactively in the component because it
 * depends on the fee-bearer toggle and the (possibly re-quoted) rate.
 */

import type { Contractor, Draft, Payout, PayoutMethod, PayoutStatus } from './types';
import type { Settlement } from './settlement';
import { FX_RATES, getContractor, methodOfKind, rateFor } from './mock';
import { formatMonthYear, formatRate } from './format';
import { makeId } from './store';

export interface CheckItem {
  id: string;
  status: 'verified' | 'warn' | 'blocked';
  label: string;
  detail: string;
}

export interface ResolvedReview {
  contractor: Contractor;
  method: PayoutMethod;
  rate: number;
  /** Rate offered if the lock expires (worse for the recipient). */
  expiryRate: number;
  arrivesAt: string;
}

/** Add business days to a date (skips Sat/Sun), returns ISO date. */
export function addBusinessDays(from: Date, days: number): string {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d.toISOString();
}

/** ETA in business days per rail (instant rails resolve same day). */
function arrivalDays(method: PayoutMethod): number {
  if (method.kind === 'wallet' || method.kind === 'stablecoin') return 0;
  return method.rail === 'IMPS' ? 1 : 2;
}

export function resolveDraft(draft: Draft): ResolvedReview | null {
  const contractor = getContractor(draft.contractorId);
  if (!contractor) return null;
  const method = methodOfKind(contractor, draft.methodKind) ?? contractor.defaultMethod;
  const rate = rateFor(contractor.currency);
  const expiryRate = FX_RATES[contractor.currency]?.expiryReQuote ?? +(rate * 0.9985).toFixed(4);
  const arrivesAt = addBusinessDays(new Date('2026-07-03T12:00:00Z'), arrivalDays(method));
  return { contractor, method, rate, expiryRate, arrivesAt };
}

/** Build the checks strip from resolved data + the live settlement (§5D). */
export function buildChecks(
  contractor: Contractor,
  draft: Draft,
  method: PayoutMethod,
): CheckItem[] {
  const checks: CheckItem[] = [];
  const first = contractor.name.split(' ')[0];

  // Recipient verification
  checks.push(
    method.verification.verified
      ? {
          id: 'recipient',
          status: 'verified',
          label: 'Recipient verified',
          detail: `Account confirmed by ${method.verification.method}.`,
        }
      : {
          id: 'recipient',
          status: 'warn',
          label: 'Recipient not yet verified',
          detail: `${method.label} is ${method.verification.method}. Payout will hold until the penny-drop clears.`,
        },
  );

  // Tax form
  const tax = contractor.taxForm;
  if (tax.status === 'valid') {
    checks.push({
      id: 'tax',
      status: 'verified',
      label: `${tax.kind} on file`,
      detail: `Valid through ${tax.validThrough ? formatMonthYear(tax.validThrough) : '—'}.`,
    });
  } else if (tax.status === 'expired') {
    checks.push({
      id: 'tax',
      status: 'blocked',
      label: `${tax.kind} expired ${tax.expiredOn ? formatMonthYear(tax.expiredOn) : ''}`,
      detail: `Payouts to ${first} are held until the form is renewed.`,
    });
  }

  // Purpose code
  if (contractor.purposeCode) {
    checks.push({
      id: 'purpose',
      status: 'verified',
      label: `Purpose code ${contractor.purposeCode.code} — ${contractor.purposeCode.label}`,
      detail: 'Reported to the receiving bank under RBI purpose-code rules.',
    });
  }

  // Carried draft flags (anomaly, duplicate)
  for (const flag of draft.flags) {
    if (flag.kind === 'amount-anomaly') {
      checks.push({
        id: 'anomaly',
        status: 'warn',
        label: 'Amount anomaly acknowledged',
        detail: flag.message,
      });
    }
    if (flag.kind === 'duplicate') {
      checks.push({
        id: 'duplicate',
        status: 'warn',
        label: 'Duplicate acknowledged',
        detail: flag.message,
      });
    }
  }

  return checks;
}

/** Whether any check blocks disbursement (compliance hold, §6e). */
export function hasBlockingCheck(checks: CheckItem[]): boolean {
  return checks.some((c) => c.status === 'blocked');
}

/** Is this the Nth identical monthly payout? Drives the recurring prompt (§5E). */
export function identicalMonthlyCount(contractor: Contractor, amountUsd: number): number {
  return contractor.history.filter((h) => h.amountUsd === amountUsd).length;
}

/** Build a committed Payout from a draft (§5F commit → §6 status). */
export function buildSentPayout(
  draft: Draft,
  resolved: ResolvedReview,
  status: PayoutStatus,
  rate: number,
): Payout {
  const now = new Date().toISOString();
  const timeline: Payout['timeline'] =
    status === 'held'
      ? [{ key: 'sent', label: 'Held pending compliance clearance' }]
      : status === 'scheduled'
        ? [{ key: 'sent', label: 'Scheduled — sends on ACH top-up arrival' }]
        : [
            { key: 'sent', label: 'Sent', at: now },
            { key: 'converted', label: `Converted at ${formatRate(rate)}`, at: now },
            { key: 'paid-out', label: `Paying out via ${resolved.method.rail}` },
            { key: 'arrived', label: 'Arrived' },
          ];

  return {
    id: makeId('pay'),
    contractorId: draft.contractorId,
    invoiceId: draft.invoiceId,
    invoiceNumber: draft.invoiceNumber,
    amountSendUsd: draft.amountSendUsd,
    method: resolved.method,
    status,
    createdAt: now,
    arrivesAt: resolved.arrivesAt,
    timeline,
    senderCoversFees: draft.senderCoversFees,
  };
}

/** A default Priya draft so /payments/review/draft_demo renders standalone. */
export function demoDraft(): Draft {
  return {
    id: 'draft_demo',
    contractorId: 'c1',
    invoiceNumber: '#1058',
    amountSendUsd: 1200,
    methodKind: 'bank',
    senderCoversFees: true,
    purposeCode: { code: 'P0802', label: 'Software consultancy' },
    flags: [],
    createdAt: new Date().toISOString(),
  };
}

/** Re-export so components import settlement helpers from one place if needed. */
export type { Settlement };
