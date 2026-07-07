/*
 * Domain types for the Paynetic payout prototype. Fully typed so the mock
 * data in mock.ts and the settlement engine in settlement.ts share one model.
 */

export type CurrencyCode = 'USD' | 'INR' | 'PHP' | 'PLN' | 'COP' | 'NGN' | 'USDC';

export type PayoutMethodKind = 'bank' | 'wallet' | 'stablecoin';

/** Human-readable rail a payout settles over (drives "arrives via ..." copy). */
export type Rail = 'IMPS' | 'NEFT' | 'ACH' | 'local-rails' | 'wallet' | 'usdc';

export type PayoutStatus =
  | 'draft'
  | 'needs-review'
  | 'scheduled'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'held';

export type AIConfidence = 'high' | 'medium' | 'low';

/** Verification method that produced a "verified" badge on an account. */
export interface AccountVerification {
  verified: boolean;
  method: string; // e.g. "penny-drop name match with HDFC Bank"
}

export interface PayoutMethod {
  kind: PayoutMethodKind;
  /** Display label, e.g. "HDFC Bank ····4821". */
  label: string;
  rail: Rail;
  verification: AccountVerification;
  feeUsd: number;
  /** Human ETA copy, e.g. "1 day" / "instant". */
  eta: string;
}

export type TaxFormStatus = 'valid' | 'expired' | 'missing';

export interface TaxForm {
  kind: 'W-8BEN' | 'W-9';
  status: TaxFormStatus;
  /** ISO date; meaning depends on status (valid-through or expired-on). */
  validThrough?: string;
  expiredOn?: string;
}

export interface PayoutHistoryEntry {
  amountUsd: number;
  date: string; // ISO
  arrivedIn: string; // "1 day"
}

export interface Contractor {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO-2, e.g. "IN"
  currency: CurrencyCode;
  defaultMethod: PayoutMethod;
  /** Alternate methods offered in the create flow. */
  methods: PayoutMethod[];
  history: PayoutHistoryEntry[];
  /** Mean of history amounts, precomputed for anomaly checks. */
  historyMeanUsd: number;
  taxForm: TaxForm;
  cryptoOptIn: boolean;
  /** RBI-style purpose code copy, only for corridors that require it. */
  purposeCode?: { code: string; label: string };
  email: string;
}

export interface FxRate {
  pair: string; // "USD/INR"
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  /** Rate offered after the 15:00 hold expires (§6c). Only INR in mock data. */
  expiryReQuote?: number;
}

/** A region the AI read from the invoice, mapped to a field for hover-linking. */
export interface InvoiceRegion {
  field: string; // matches a form field key
  /** Percentage coordinates within the rendered document frame. */
  rect: { top: number; left: number; width: number; height: number };
}

export interface InvoiceLineItem {
  description: string;
  amountUsd: number;
  /** True for items not present in the contractor's contract (bulk anomaly). */
  unexpected?: boolean;
}

export interface InvoiceField<T> {
  value: T;
  confidence: AIConfidence;
  /** Provenance copy shown in the popover. */
  evidence: string;
}

export interface Invoice {
  id: string;
  contractorId: string;
  number: string; // "#1042"
  senderName: string; // "Priya Sharma Design Studio"
  senderEmail: string;
  period: string; // "June 2026"
  issueDate: string; // ISO
  currency: CurrencyCode;
  /** Field-level AI extraction with confidence + evidence (§4b). */
  fields: {
    amountUsd: InvoiceField<number>;
    invoiceNumber: InvoiceField<string>;
    contractorMatch: InvoiceField<string>; // contractor id
    dueDate: InvoiceField<string | null>;
  };
  lineItems: InvoiceLineItem[];
  regions: InvoiceRegion[];
  /** Set when this invoice duplicates another (§4b duplicate guard). */
  duplicateOfInvoiceId?: string;
  duplicateOfPayoutId?: string;
}

export interface TimelineEvent {
  key: 'sent' | 'converted' | 'paid-out' | 'arrived' | 'failed';
  label: string;
  at?: string; // ISO timestamp; absent = not yet reached
  failed?: boolean;
}

export interface Payout {
  id: string;
  contractorId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amountSendUsd: number;
  method: PayoutMethod;
  status: PayoutStatus;
  createdAt: string;
  arrivesAt?: string; // ISO
  arrivedAt?: string; // ISO
  timeline: TimelineEvent[];
  failureReason?: string;
  /** Whether the sender covered fees for this payout. */
  senderCoversFees: boolean;
}

export interface Wallet {
  balanceUsd: number;
  apy: number; // 3.1 => 3.1%
  mtdYieldUsd: number;
}

/** Reasons a payout draft carries an acknowledged flag onto the review screen. */
export type FlagKind =
  | 'amount-anomaly'
  | 'duplicate'
  | 'w8ben-expired'
  | 'low-balance';

export interface DraftFlag {
  kind: FlagKind;
  severity: 'warn' | 'blocked';
  message: string;
}

/**
 * How the sender denominated a manual payout. Contractors are paid in their
 * local currency (fixed sum, or an hourly rate × hours); the USD the sender
 * pays is derived from the corridor rate. `amountSendUsd` on the draft stays
 * the canonical figure the settlement engine consumes.
 */
export type PayBasis =
  | { mode: 'fixed'; currency: CurrencyCode; localAmount: number }
  | { mode: 'hourly'; currency: CurrencyCode; hourlyRate: number; hours: number };

/** A payout being composed in the create flow, before it becomes a Payout. */
export interface Draft {
  id: string;
  contractorId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amountSendUsd: number;
  /** Local-currency basis for a manually entered payout (§ local-currency entry). */
  payBasis?: PayBasis;
  methodKind: PayoutMethodKind;
  senderCoversFees: boolean;
  purposeCode?: { code: string; label: string };
  note?: string;
  flags: DraftFlag[];
  createdAt: string;
}

/** One row in the bulk approval batch (§7). */
export type BulkVerdict = 'clean' | 'flagged';

export interface BulkItem {
  payoutDraftId: string;
  contractorId: string;
  invoiceId?: string;
  amountUsd: number;
  verdict: BulkVerdict;
  /** Human-readable anomaly reason (primary text for flagged rows). */
  reason: string;
  /** Expandable evidence bullets. */
  evidence: string[];
  /** Flagged fraud rows require typed-name confirmation to approve anyway. */
  requiresNameConfirm?: boolean;
  duplicateOfPayoutId?: string;
}
