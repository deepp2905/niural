/*
 * AI-verify-on-manual-input logic (§4a, law #1: without an invoice the human
 * proposes and AI verifies). Pure functions over contractor history so the
 * same checks feed the create form and the review screen's checks strip.
 */

import type { Contractor, DraftFlag } from './types';
import { formatUSD } from './format';

/** Deviation threshold: >2.5× the contractor's mean payout triggers a flag. */
export const ANOMALY_MULTIPLE = 2.5;

export interface AmountAnomaly {
  ratio: number; // e.g. 10 => "10× typical"
  message: string;
}

/** Flag a manual amount that deviates sharply from the contractor's history. */
export function amountAnomaly(
  contractor: Contractor,
  amountUsd: number,
): AmountAnomaly | null {
  const mean = contractor.historyMeanUsd;
  if (!mean || amountUsd <= 0) return null;
  const ratio = amountUsd / mean;
  if (ratio <= ANOMALY_MULTIPLE) return null;

  const first = contractor.name.split(' ')[0];
  const rounded = ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10;
  return {
    ratio,
    message: `${rounded}× ${first}'s typical payout of ${formatUSD(mean)}. Continue if intentional.`,
  };
}

export interface GhostPrior {
  amountUsd: number;
  label: string;
}

/** Suggest an amount when the contractor's recent payouts are consistent. */
export function ghostPrior(contractor: Contractor): GhostPrior | null {
  const recent = contractor.history.slice(0, 3);
  if (recent.length < 2) return null;
  const allEqual = recent.every((h) => h.amountUsd === recent[0].amountUsd);
  if (!allEqual) return null;
  const count = recent.length;
  return {
    amountUsd: recent[0].amountUsd,
    label: `${formatUSD(recent[0].amountUsd)} — matches last ${count} monthly payouts`,
  };
}

/** Build the DraftFlag list carried from create → review (§5D checks strip). */
export function buildFlags(params: {
  contractor: Contractor;
  amountUsd: number;
  duplicateAcknowledged?: boolean;
  duplicateInvoiceNumber?: string;
  lowBalanceShortfallUsd?: number;
}): DraftFlag[] {
  const flags: DraftFlag[] = [];

  const anomaly = amountAnomaly(params.contractor, params.amountUsd);
  if (anomaly) {
    flags.push({
      kind: 'amount-anomaly',
      severity: 'warn',
      message: `Amount anomaly acknowledged — ${anomaly.message.replace(' Continue if intentional.', '')}`,
    });
  }

  if (params.duplicateAcknowledged) {
    flags.push({
      kind: 'duplicate',
      severity: 'warn',
      message: `Duplicate acknowledged — invoice ${params.duplicateInvoiceNumber ?? ''}`.trim(),
    });
  }

  // Expired tax form is a blocking compliance item (§6e).
  if (params.contractor.taxForm.status === 'expired') {
    const when = params.contractor.taxForm.expiredOn;
    flags.push({
      kind: 'w8ben-expired',
      severity: 'blocked',
      message: `W-8BEN expired${when ? ` ${monthYear(when)}` : ''} — payouts to ${
        params.contractor.name.split(' ')[0]
      } are held until renewed.`,
    });
  }

  if (params.lowBalanceShortfallUsd && params.lowBalanceShortfallUsd > 0) {
    flags.push({
      kind: 'low-balance',
      severity: 'warn',
      message: `This payout exceeds your USD balance by ${formatUSD(params.lowBalanceShortfallUsd)}.`,
    });
  }

  return flags;
}

function monthYear(iso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(iso);
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
