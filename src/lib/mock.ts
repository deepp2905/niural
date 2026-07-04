/*
 * Mock data for the prototype (§9). Fully typed against types.ts. No backend,
 * no network — this module is the whole "database". Lookups at the bottom.
 *
 * Reference "today" for the prototype: 2026-07-03.
 */

import type {
  BulkItem,
  Contractor,
  CurrencyCode,
  FxRate,
  Invoice,
  Payout,
  PayoutMethod,
  PayoutMethodKind,
  Wallet,
} from './types';

/* ----------------------------------------------------------------- FX feed */

export const FX_RATES: Record<string, FxRate> = {
  INR: { pair: 'USD/INR', base: 'USD', quote: 'INR', rate: 83.215, expiryReQuote: 83.071 },
  PHP: { pair: 'USD/PHP', base: 'USD', quote: 'PHP', rate: 58.9 },
  PLN: { pair: 'USD/PLN', base: 'USD', quote: 'PLN', rate: 3.94 },
  COP: { pair: 'USD/COP', base: 'USD', quote: 'COP', rate: 4105 },
  NGN: { pair: 'USD/NGN', base: 'USD', quote: 'NGN', rate: 1545 },
  USD: { pair: 'USD/USD', base: 'USD', quote: 'USD', rate: 1 },
  USDC: { pair: 'USD/USDC', base: 'USD', quote: 'USDC', rate: 1 },
};

/** The paying company (Maya's startup, §1). */
export const COMPANY_NAME = 'Northwind Labs';

export const FEE_MODEL: Record<PayoutMethodKind, number> = {
  bank: 4.99,
  wallet: 1.99,
  stablecoin: 2.49,
};

export function rateFor(currency: CurrencyCode): number {
  return FX_RATES[currency]?.rate ?? 1;
}

export function feeFor(kind: PayoutMethodKind): number {
  return FEE_MODEL[kind];
}

/* ----------------------------------------------------------- Method builders */

function walletMethod(): PayoutMethod {
  return {
    kind: 'wallet',
    label: 'Paynetic Wallet',
    rail: 'wallet',
    verification: { verified: true, method: 'wallet balance, held by Paynetic' },
    feeUsd: FEE_MODEL.wallet,
    eta: 'instant',
  };
}

function stablecoinMethod(verified = true): PayoutMethod {
  return {
    kind: 'stablecoin',
    label: 'USDC (self-custody wallet)',
    rail: 'usdc',
    verification: { verified, method: 'on-chain address' },
    feeUsd: FEE_MODEL.stablecoin,
    eta: 'instant',
  };
}

/* ------------------------------------------------------------- Contractors */

export const CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'Priya Sharma',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    currency: 'INR',
    defaultMethod: {
      kind: 'bank',
      label: 'HDFC Bank ····4821',
      rail: 'IMPS',
      verification: { verified: true, method: 'penny-drop name match with HDFC Bank' },
      feeUsd: FEE_MODEL.bank,
      eta: '1 day',
    },
    methods: [
      {
        kind: 'bank',
        label: 'HDFC Bank ····4821',
        rail: 'IMPS',
        verification: { verified: true, method: 'penny-drop name match with HDFC Bank' },
        feeUsd: FEE_MODEL.bank,
        eta: '1 day',
      },
      walletMethod(),
      stablecoinMethod(false),
    ],
    history: [
      { amountUsd: 1200, date: '2026-06-01', arrivedIn: '1 day' },
      { amountUsd: 1200, date: '2026-05-01', arrivedIn: '1 day' },
      { amountUsd: 1200, date: '2026-04-01', arrivedIn: '1 day' },
    ],
    historyMeanUsd: 1200,
    taxForm: { kind: 'W-8BEN', status: 'valid', validThrough: '2027-03-31' },
    cryptoOptIn: false,
    purposeCode: { code: 'P0802', label: 'Software consultancy' },
    email: 'priya@priyasharmadesign.com',
  },
  {
    id: 'c2',
    name: 'Mateo Aguirre',
    country: 'Argentina',
    countryCode: 'AR',
    flag: '🇦🇷',
    currency: 'USDC',
    defaultMethod: stablecoinMethod(true),
    methods: [
      stablecoinMethod(true),
      walletMethod(),
      {
        kind: 'bank',
        label: 'Banco Galicia ····7730 (ARS)',
        rail: 'local-rails',
        verification: { verified: true, method: 'CBU name match' },
        feeUsd: FEE_MODEL.bank,
        eta: '1–2 days',
      },
    ],
    history: [
      { amountUsd: 2000, date: '2026-06-05', arrivedIn: 'instant' },
      { amountUsd: 2000, date: '2026-05-05', arrivedIn: 'instant' },
    ],
    historyMeanUsd: 2000,
    taxForm: { kind: 'W-8BEN', status: 'valid', validThrough: '2027-09-30' },
    cryptoOptIn: true,
    email: 'mateo.aguirre@protonmail.com',
  },
  {
    id: 'c3',
    name: 'Chen Wei',
    country: 'Philippines',
    countryCode: 'PH',
    flag: '🇵🇭',
    currency: 'PHP',
    defaultMethod: walletMethod(),
    methods: [
      walletMethod(),
      {
        kind: 'bank',
        label: 'BDO ····9013',
        rail: 'local-rails',
        verification: { verified: true, method: 'name match with BDO' },
        feeUsd: FEE_MODEL.bank,
        eta: '1 day',
      },
      stablecoinMethod(false),
    ],
    history: [{ amountUsd: 6000, date: '2026-06-28', arrivedIn: 'instant' }],
    historyMeanUsd: 6000,
    taxForm: { kind: 'W-8BEN', status: 'valid', validThrough: '2027-01-31' },
    cryptoOptIn: false,
    email: 'chen.wei@outlook.com',
  },
  {
    id: 'c4',
    name: 'Sofia Marin',
    country: 'Colombia',
    countryCode: 'CO',
    flag: '🇨🇴',
    currency: 'COP',
    defaultMethod: {
      kind: 'bank',
      label: 'Bancolombia ····2288',
      rail: 'local-rails',
      verification: { verified: true, method: 'name match with Bancolombia' },
      feeUsd: FEE_MODEL.bank,
      eta: '1–2 days',
    },
    methods: [
      {
        kind: 'bank',
        label: 'Bancolombia ····2288',
        rail: 'local-rails',
        verification: { verified: true, method: 'name match with Bancolombia' },
        feeUsd: FEE_MODEL.bank,
        eta: '1–2 days',
      },
      walletMethod(),
    ],
    history: [
      { amountUsd: 900, date: '2026-06-10', arrivedIn: '2 days' },
      { amountUsd: 900, date: '2026-05-10', arrivedIn: '2 days' },
      { amountUsd: 900, date: '2026-04-10', arrivedIn: '2 days' },
      { amountUsd: 900, date: '2026-03-10', arrivedIn: '2 days' },
    ],
    historyMeanUsd: 900,
    // Expired W-8BEN — drives the compliance hold (§6e).
    taxForm: { kind: 'W-8BEN', status: 'expired', expiredOn: '2026-05-31' },
    cryptoOptIn: false,
    email: 'sofia.marin@gmail.com',
  },
  {
    id: 'c5',
    name: 'Aleksei Volkov',
    country: 'Poland',
    countryCode: 'PL',
    flag: '🇵🇱',
    currency: 'PLN',
    defaultMethod: {
      kind: 'bank',
      // New account, changed 4 days ago — unverified (fraud flag, §7).
      label: 'Santander PL ····5567 (new)',
      rail: 'local-rails',
      verification: { verified: false, method: 'awaiting penny-drop verification' },
      feeUsd: FEE_MODEL.bank,
      eta: '1 day',
    },
    methods: [
      {
        kind: 'bank',
        label: 'Santander PL ····5567 (new)',
        rail: 'local-rails',
        verification: { verified: false, method: 'awaiting penny-drop verification' },
        feeUsd: FEE_MODEL.bank,
        eta: '1 day',
      },
      walletMethod(),
    ],
    history: [
      { amountUsd: 1800, date: '2026-06-02', arrivedIn: '1 day' },
      { amountUsd: 1800, date: '2026-05-02', arrivedIn: '1 day' },
      { amountUsd: 1800, date: '2026-04-02', arrivedIn: '1 day' },
      { amountUsd: 1800, date: '2026-03-02', arrivedIn: '1 day' },
      { amountUsd: 1800, date: '2026-02-02', arrivedIn: '1 day' },
    ],
    historyMeanUsd: 1800,
    taxForm: { kind: 'W-8BEN', status: 'valid', validThrough: '2027-06-30' },
    cryptoOptIn: false,
    email: 'aleksei.volkov@wp.pl',
  },
  {
    id: 'c6',
    name: 'Amara Okafor',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    currency: 'NGN',
    defaultMethod: walletMethod(),
    methods: [
      walletMethod(),
      {
        kind: 'bank',
        label: 'GTBank ····4402',
        rail: 'local-rails',
        verification: { verified: true, method: 'name match with GTBank' },
        feeUsd: FEE_MODEL.bank,
        eta: '1 day',
      },
    ],
    history: [
      { amountUsd: 750, date: '2026-06-15', arrivedIn: 'instant' },
      { amountUsd: 750, date: '2026-05-15', arrivedIn: 'instant' },
    ],
    historyMeanUsd: 750,
    taxForm: { kind: 'W-8BEN', status: 'valid', validThrough: '2027-11-30' },
    cryptoOptIn: false,
    email: 'amara.okafor@gmail.com',
  },
];

/* ---------------------------------------------------------------- Invoices */

export const INVOICES: Invoice[] = [
  // inv_006 — Priya's June invoice, the parsed-path hero (§4b).
  {
    id: 'inv_006',
    contractorId: 'c1',
    number: '#1058',
    senderName: 'Priya Sharma Design Studio',
    senderEmail: 'priya@priyasharmadesign.com',
    period: 'June 2026',
    issueDate: '2026-06-30',
    currency: 'USD',
    fields: {
      amountUsd: {
        value: 1200,
        confidence: 'high',
        evidence: "Read from invoice line 'Total Due: $1,200.00' · 99% match",
      },
      invoiceNumber: {
        value: '#1058',
        confidence: 'high',
        evidence: "Read from header 'Invoice #1058' · 98% match",
      },
      contractorMatch: {
        value: 'c1',
        confidence: 'medium',
        evidence:
          "Matched 'Priya Sharma Design Studio' → Priya Sharma · sender email matches contractor record · 3 prior invoices, same amount",
      },
      dueDate: {
        value: null,
        confidence: 'low',
        evidence: 'Due-date field is smudged in the scan · best guess Jul 15, low confidence',
      },
    },
    lineItems: [{ description: 'Software consultancy — June 2026', amountUsd: 1200 }],
    // % coordinates within the rendered document frame, for hover-linking.
    regions: [
      { field: 'invoiceNumber', rect: { top: 8, left: 55, width: 38, height: 6 } },
      { field: 'contractorMatch', rect: { top: 20, left: 6, width: 55, height: 10 } },
      { field: 'dueDate', rect: { top: 33, left: 55, width: 38, height: 6 } },
      { field: 'amountUsd', rect: { top: 68, left: 45, width: 48, height: 8 } },
    ],
  },

  // inv_004 — the ORIGINAL Priya invoice #1042, already paid (dup reference).
  {
    id: 'inv_004',
    contractorId: 'c1',
    number: '#1042',
    senderName: 'Priya Sharma Design Studio',
    senderEmail: 'priya@priyasharmadesign.com',
    period: 'May 2026',
    issueDate: '2026-05-31',
    currency: 'USD',
    fields: {
      amountUsd: { value: 1200, confidence: 'high', evidence: "Read from 'Total Due: $1,200.00'" },
      invoiceNumber: { value: '#1042', confidence: 'high', evidence: "Read from header 'Invoice #1042'" },
      contractorMatch: { value: 'c1', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-06-03', confidence: 'high', evidence: "Read from 'Due: Jun 3, 2026'" },
    },
    lineItems: [{ description: 'Software consultancy — May 2026', amountUsd: 1200 }],
    regions: [],
  },

  // inv_007 — duplicate of inv_004 (§4b duplicate guard).
  {
    id: 'inv_007',
    contractorId: 'c1',
    number: '#1042',
    senderName: 'Priya Sharma Design Studio',
    senderEmail: 'priya@priyasharmadesign.com',
    period: 'May 2026',
    issueDate: '2026-06-02',
    currency: 'USD',
    fields: {
      amountUsd: { value: 1200, confidence: 'high', evidence: "Read from 'Total Due: $1,200.00'" },
      invoiceNumber: { value: '#1042', confidence: 'high', evidence: "Read from header 'Invoice #1042'" },
      contractorMatch: { value: 'c1', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-06-03', confidence: 'medium', evidence: "Read from 'Due: Jun 3, 2026'" },
    },
    lineItems: [{ description: 'Software consultancy — May 2026', amountUsd: 1200 }],
    regions: [],
    duplicateOfInvoiceId: 'inv_004',
    duplicateOfPayoutId: 'pay_002',
  },

  // inv_010 — Priya's $3,400 rush-fee invoice (bulk anomaly, §7 flagged #1).
  {
    id: 'inv_010',
    contractorId: 'c1',
    number: '#1061',
    senderName: 'Priya Sharma Design Studio',
    senderEmail: 'priya@priyasharmadesign.com',
    period: 'June 2026 (revised)',
    issueDate: '2026-06-30',
    currency: 'USD',
    fields: {
      amountUsd: { value: 3400, confidence: 'high', evidence: "Read from 'Total Due: $3,400.00'" },
      invoiceNumber: { value: '#1061', confidence: 'high', evidence: "Read from header 'Invoice #1061'" },
      contractorMatch: { value: 'c1', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-07-15', confidence: 'high', evidence: "Read from 'Due: Jul 15, 2026'" },
    },
    lineItems: [
      { description: 'Software consultancy — June 2026', amountUsd: 1200 },
      { description: 'Rush delivery fee', amountUsd: 800, unexpected: true },
      { description: 'Additional revisions (14 hrs)', amountUsd: 1400, unexpected: true },
    ],
    regions: [],
  },

  // inv_011 — Aleksei's post-account-change invoice (bulk fraud flag, §7 #2).
  {
    id: 'inv_011',
    contractorId: 'c5',
    number: '#A-224',
    senderName: 'Aleksei Volkov',
    senderEmail: 'aleksei.volkov@wp.pl',
    period: 'June 2026',
    issueDate: '2026-06-30',
    currency: 'USD',
    fields: {
      amountUsd: { value: 1800, confidence: 'high', evidence: "Read from 'Total Due: $1,800.00'" },
      invoiceNumber: { value: '#A-224', confidence: 'high', evidence: "Read from header" },
      contractorMatch: { value: 'c5', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-07-14', confidence: 'high', evidence: "Read from 'Due: Jul 14, 2026'" },
    },
    lineItems: [{ description: 'Backend engineering — June 2026', amountUsd: 1800 }],
    regions: [],
  },

  // inv_012 — Chen's possible-duplicate invoice (bulk flag, §7 #3).
  {
    id: 'inv_012',
    contractorId: 'c3',
    number: '#CW-88',
    senderName: 'Chen Wei',
    senderEmail: 'chen.wei@outlook.com',
    period: 'June 2026',
    issueDate: '2026-06-29',
    currency: 'USD',
    fields: {
      amountUsd: { value: 1600, confidence: 'high', evidence: "Read from 'Total Due: $1,600.00'" },
      invoiceNumber: { value: '#CW-88', confidence: 'high', evidence: 'Read from header' },
      contractorMatch: { value: 'c3', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-07-12', confidence: 'high', evidence: "Read from 'Due: Jul 12, 2026'" },
    },
    lineItems: [{ description: 'QA automation — June 2026', amountUsd: 1600 }],
    regions: [],
    duplicateOfPayoutId: 'pay_004',
  },

  // inv_013 — Mateo's clean June invoice (bulk clean).
  {
    id: 'inv_013',
    contractorId: 'c2',
    number: '#MA-19',
    senderName: 'Mateo Aguirre',
    senderEmail: 'mateo.aguirre@protonmail.com',
    period: 'June 2026',
    issueDate: '2026-06-30',
    currency: 'USD',
    fields: {
      amountUsd: { value: 2000, confidence: 'high', evidence: "Read from 'Total Due: $2,000.00'" },
      invoiceNumber: { value: '#MA-19', confidence: 'high', evidence: 'Read from header' },
      contractorMatch: { value: 'c2', confidence: 'high', evidence: 'Sender email matches contractor record' },
      dueDate: { value: '2026-07-15', confidence: 'high', evidence: "Read from 'Due: Jul 15, 2026'" },
    },
    lineItems: [{ description: 'Platform engineering retainer — June 2026', amountUsd: 2000 }],
    regions: [],
  },
];

/* ----------------------------------------------------------------- Payouts */

export const PAYOUTS: Payout[] = [
  // Processing
  {
    id: 'pay_001',
    contractorId: 'c6',
    invoiceNumber: '#AO-31',
    amountSendUsd: 750,
    method: CONTRACTORS[5].defaultMethod,
    status: 'processing',
    createdAt: '2026-07-02T14:10:00Z',
    arrivesAt: '2026-07-03T14:10:00Z',
    timeline: [
      { key: 'sent', label: 'Sent', at: '2026-07-02T14:10:00Z' },
      { key: 'converted', label: 'Converted', at: '2026-07-02T14:11:00Z' },
      { key: 'paid-out', label: 'Paying out via wallet' },
      { key: 'arrived', label: 'Arrived' },
    ],
    senderCoversFees: true,
  },
  // Paid
  {
    id: 'pay_002',
    contractorId: 'c1',
    invoiceId: 'inv_004',
    invoiceNumber: '#1042',
    amountSendUsd: 1200,
    method: CONTRACTORS[0].defaultMethod,
    status: 'paid',
    createdAt: '2026-06-01T09:00:00Z',
    arrivedAt: '2026-06-02T11:30:00Z',
    timeline: [
      { key: 'sent', label: 'Sent', at: '2026-06-01T09:00:00Z' },
      { key: 'converted', label: 'Converted at 83.2150', at: '2026-06-01T09:01:00Z' },
      { key: 'paid-out', label: 'Paid out via IMPS', at: '2026-06-01T09:04:00Z' },
      { key: 'arrived', label: 'Arrived', at: '2026-06-02T11:30:00Z' },
    ],
    senderCoversFees: true,
  },
  // Failed — the fallback-ladder hero (§6d)
  {
    id: 'pay_009',
    contractorId: 'c1',
    invoiceNumber: '#1055',
    amountSendUsd: 1200,
    method: CONTRACTORS[0].defaultMethod,
    status: 'failed',
    createdAt: '2026-06-25T10:00:00Z',
    timeline: [
      { key: 'sent', label: 'Sent', at: '2026-06-25T10:00:00Z' },
      { key: 'converted', label: 'Converted at 83.2150', at: '2026-06-25T10:01:00Z' },
      { key: 'paid-out', label: 'Paid out — failed', at: '2026-06-25T10:05:00Z', failed: true },
      { key: 'arrived', label: 'Arrived' },
    ],
    failureReason:
      'Receiving bank rejected: account name mismatch (beneficiary name changed at bank).',
    senderCoversFees: true,
  },
  // Held (compliance) — Sofia, expired W-8BEN
  {
    id: 'pay_003',
    contractorId: 'c4',
    invoiceNumber: '#SM-40',
    amountSendUsd: 900,
    method: CONTRACTORS[3].defaultMethod,
    status: 'held',
    createdAt: '2026-07-01T08:00:00Z',
    timeline: [{ key: 'sent', label: 'Held pending W-8BEN renewal' }],
    senderCoversFees: true,
  },
  // Scheduled
  {
    id: 'pay_005',
    contractorId: 'c2',
    invoiceNumber: '#MA-18',
    amountSendUsd: 2000,
    method: CONTRACTORS[1].defaultMethod,
    status: 'scheduled',
    createdAt: '2026-07-01T08:00:00Z',
    arrivesAt: '2026-07-28T08:00:00Z',
    timeline: [{ key: 'sent', label: 'Scheduled for Jul 28' }],
    senderCoversFees: true,
  },
];

/* ------------------------------------------------------------------ Wallet */

export const WALLET: Wallet = {
  balanceUsd: 48220,
  apy: 3.1,
  mtdYieldUsd: 41.3,
};

/** Low-balance scenario value (§6b, §9 scenario flag). */
export const WALLET_LOW_BALANCE = 4220;

/* ------------------------------------------------------------ Bulk batch (§7) */

export const BULK_ITEMS: BulkItem[] = [
  // ---- Flagged (always on top) ----
  {
    payoutDraftId: 'bulk_1',
    contractorId: 'c1',
    invoiceId: 'inv_010',
    amountUsd: 3400,
    verdict: 'flagged',
    reason:
      "2.8× this contractor's average. Invoice includes a new line item 'Rush delivery fee — $800' not present in her contract.",
    evidence: [
      "Priya's average payout is $1,200 across her last 3 invoices.",
      "New line items: 'Rush delivery fee' ($800), 'Additional revisions, 14 hrs' ($1,400).",
      'Neither line item appears in the signed contract (fixed monthly retainer).',
    ],
  },
  {
    payoutDraftId: 'bulk_2',
    contractorId: 'c5',
    invoiceId: 'inv_011',
    amountUsd: 1800,
    verdict: 'flagged',
    reason:
      'Bank details changed 4 days ago, 2 days before this invoice arrived. New account at a different bank. This pattern matches payment-diversion fraud.',
    evidence: [
      'Previous account: mBank ····1120 (used for 5 prior payouts).',
      'New account: Santander PL ····5567, added Jun 29.',
      'Invoice arrived Jun 30 — 1 day after the account change.',
      'Recommend voice verification before approving.',
    ],
    requiresNameConfirm: true,
  },
  {
    payoutDraftId: 'bulk_3',
    contractorId: 'c3',
    invoiceId: 'inv_012',
    amountUsd: 1600,
    verdict: 'flagged',
    reason: 'Possible duplicate of a payout sent Jun 28 ($1,600 to Chen Wei, same invoice period).',
    evidence: [
      'A $1,600 payout to Chen Wei cleared Jun 28 (pay_004).',
      'Same invoice period (June 2026) and same amount.',
      'Invoice number differs (#CW-88 vs #CW-87) — could be a re-send.',
    ],
    duplicateOfPayoutId: 'pay_004',
  },

  // ---- Clean (six) ----
  {
    payoutDraftId: 'bulk_4',
    contractorId: 'c2',
    invoiceId: 'inv_013',
    amountUsd: 2000,
    verdict: 'clean',
    reason: 'June retainer · 3rd identical monthly invoice · matches contract',
    evidence: [
      'Amount $2,000 matches the last 2 monthly invoices exactly.',
      'Sender email matches contractor record.',
      'Paid to opted-in USDC self-custody wallet, as configured.',
    ],
  },
  {
    payoutDraftId: 'bulk_5',
    contractorId: 'c6',
    amountUsd: 750,
    verdict: 'clean',
    reason: 'June support retainer · matches contract rate',
    evidence: [
      'Amount $750 matches the agreed monthly rate.',
      'Sender email matches contractor record.',
    ],
  },
  {
    payoutDraftId: 'bulk_6',
    contractorId: 'c2',
    amountUsd: 1500,
    verdict: 'clean',
    reason: 'Approved change-order · within contract ceiling',
    evidence: [
      'Change order CO-4 approved by project lead on Jun 20.',
      'Total June spend ($3,500) is within the $4,000 monthly ceiling.',
    ],
  },
  {
    payoutDraftId: 'bulk_7',
    contractorId: 'c6',
    amountUsd: 980,
    verdict: 'clean',
    reason: 'Extra support hours · pre-approved',
    evidence: ['18 additional support hours logged and approved.'],
  },
  {
    payoutDraftId: 'bulk_8',
    contractorId: 'c2',
    amountUsd: 1200,
    verdict: 'clean',
    reason: 'Q2 documentation milestone · matches statement of work',
    evidence: ['Milestone M-3 marked complete Jun 27.'],
  },
  {
    payoutDraftId: 'bulk_9',
    contractorId: 'c6',
    amountUsd: 1000,
    verdict: 'clean',
    reason: 'Onboarding materials · one-time, pre-approved',
    evidence: ['One-time deliverable, approved in the June planning doc.'],
  },
];

/* ----------------------------------------------------------------- Lookups */

export function getContractor(id: string): Contractor | undefined {
  return CONTRACTORS.find((c) => c.id === id);
}

export function getInvoice(id: string): Invoice | undefined {
  return INVOICES.find((i) => i.id === id);
}

export function getPayout(id: string): Payout | undefined {
  return PAYOUTS.find((p) => p.id === id);
}

export function methodOfKind(
  contractor: Contractor,
  kind: PayoutMethodKind,
): PayoutMethod | undefined {
  return contractor.methods.find((m) => m.kind === kind);
}
