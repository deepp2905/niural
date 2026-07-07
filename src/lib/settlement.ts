/*
 * Settlement engine — the ONE place money math happens (§0). Components never
 * compute money inline; they render a Settlement object produced here. The same
 * object drives the admin review screen and the contractor remittance view.
 *
 * Product stance (§9): zero FX spread. The only cost is the flat method fee.
 */

import type { CurrencyCode, PayBasis, PayoutMethod, Rail } from './types';

/** Local-currency total a pay basis denominates: a fixed sum, or rate × hours. */
export function payBasisLocalTotal(basis: PayBasis): number {
  return basis.mode === 'fixed' ? basis.localAmount : basis.hourlyRate * basis.hours;
}

/**
 * USD the sender pays to deliver a local-currency total, at a USD→local rate.
 * Inverse of the receive-side conversion (§9: zero FX spread — the corridor
 * mid-market rate is the only thing between the two figures).
 */
export function usdFromLocal(localTotal: number, rate: number): number {
  return rate > 0 ? localTotal / rate : 0;
}

export interface SettlementInput {
  /** Amount the sender denominates the payout in, always USD in this product. */
  amountSendUsd: number;
  receiveCurrency: CurrencyCode;
  /** Mid-market rate USD -> receiveCurrency. Use 1 for USDC (pegged). */
  rate: number;
  feeUsd: number;
  rail: Rail;
  /** true: recipient gets the full send-amount equivalent, sender pays fee on
   *  top. false: fee is taken out of the payout, recipient receives less. */
  senderCoversFees: boolean;
  arrivesAt: string; // ISO
  rateLocked?: boolean;
}

export interface Settlement {
  sendCurrency: CurrencyCode; // 'USD'
  receiveCurrency: CurrencyCode;
  youSendUsd: number;
  feeUsd: number;
  senderCoversFees: boolean;
  rate: number;
  /** USD actually converted to the receive currency (after fee handling). */
  usdConverted: number;
  /** Amount landing in the recipient's account, in the receive currency. */
  receiveAmount: number;
  /** Exact amount debited from the wallet — the number on the commit button. */
  totalDebitUsd: number;
  rail: Rail;
  arrivesAt: string;
  rateLocked: boolean;
}

export function computeSettlement(input: SettlementInput): Settlement {
  const {
    amountSendUsd,
    receiveCurrency,
    rate,
    feeUsd,
    rail,
    senderCoversFees,
    arrivesAt,
    rateLocked = true,
  } = input;

  // Which USD figure gets converted, and what the wallet is debited.
  const usdConverted = senderCoversFees ? amountSendUsd : amountSendUsd - feeUsd;
  const totalDebitUsd = senderCoversFees ? amountSendUsd + feeUsd : amountSendUsd;

  const receiveAmount = usdConverted * rate;

  return {
    sendCurrency: 'USD',
    receiveCurrency,
    youSendUsd: amountSendUsd,
    feeUsd,
    senderCoversFees,
    rate,
    usdConverted,
    receiveAmount,
    totalDebitUsd,
    rail,
    arrivesAt,
    rateLocked,
  };
}

/** Convenience overload: derive fee/rail/currency straight from a method. */
export function settlementFromMethod(params: {
  amountSendUsd: number;
  receiveCurrency: CurrencyCode;
  rate: number;
  method: PayoutMethod;
  senderCoversFees: boolean;
  arrivesAt: string;
  rateLocked?: boolean;
}): Settlement {
  return computeSettlement({
    amountSendUsd: params.amountSendUsd,
    receiveCurrency: params.receiveCurrency,
    rate: params.rate,
    feeUsd: params.method.feeUsd,
    rail: params.method.rail,
    senderCoversFees: params.senderCoversFees,
    arrivesAt: params.arrivesAt,
    rateLocked: params.rateLocked,
  });
}

export interface ReQuoteDelta {
  next: Settlement;
  /** Change in the recipient's amount (receive currency). Negative = less. */
  receiveDelta: number;
  direction: 'less' | 'more' | 'same';
}

/** Recompute a settlement at a new rate and report the recipient-side delta. */
export function reQuote(current: Settlement, newRate: number): ReQuoteDelta {
  const next = computeSettlement({
    amountSendUsd: current.youSendUsd,
    receiveCurrency: current.receiveCurrency,
    rate: newRate,
    feeUsd: current.feeUsd,
    rail: current.rail,
    senderCoversFees: current.senderCoversFees,
    arrivesAt: current.arrivesAt,
    rateLocked: true,
  });
  const receiveDelta = next.receiveAmount - current.receiveAmount;
  const direction: ReQuoteDelta['direction'] =
    Math.abs(receiveDelta) < 0.005 ? 'same' : receiveDelta < 0 ? 'less' : 'more';
  return { next, receiveDelta, direction };
}

export interface WalletImpact {
  balanceBeforeUsd: number;
  balanceAfterUsd: number;
  /** Positive number of USD the payout exceeds the balance by, or 0. */
  shortfallUsd: number;
  sufficient: boolean;
}

/** How a settlement lands against a wallet balance (§5C, §6b low-balance). */
export function walletImpact(balanceUsd: number, settlement: Settlement): WalletImpact {
  const balanceAfterUsd = balanceUsd - settlement.totalDebitUsd;
  const shortfallUsd = balanceAfterUsd < 0 ? -balanceAfterUsd : 0;
  return {
    balanceBeforeUsd: balanceUsd,
    balanceAfterUsd,
    shortfallUsd,
    sufficient: shortfallUsd === 0,
  };
}
