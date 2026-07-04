import { describe, it, expect } from 'vitest';
import {
  computeSettlement,
  reQuote,
  walletImpact,
  type SettlementInput,
} from './settlement';

const priyaBase: SettlementInput = {
  amountSendUsd: 1200,
  receiveCurrency: 'INR',
  rate: 83.215,
  feeUsd: 4.99,
  rail: 'IMPS',
  senderCoversFees: true,
  arrivesAt: '2026-07-10',
};

describe('computeSettlement — sender covers fees', () => {
  const s = computeSettlement(priyaBase);

  it('converts the full send amount when sender covers the fee', () => {
    expect(s.usdConverted).toBe(1200);
    expect(s.receiveAmount).toBeCloseTo(99858, 0); // 1200 * 83.215
  });

  it('debits send amount plus fee from the wallet', () => {
    expect(s.totalDebitUsd).toBeCloseTo(1204.99, 2);
  });
});

describe('computeSettlement — fees deducted from payout', () => {
  const s = computeSettlement({ ...priyaBase, senderCoversFees: false });

  it('converts send amount minus fee', () => {
    expect(s.usdConverted).toBeCloseTo(1195.01, 2);
    expect(s.receiveAmount).toBeCloseTo(1195.01 * 83.215, 2);
  });

  it('debits exactly the send amount', () => {
    expect(s.totalDebitUsd).toBe(1200);
  });

  it('recipient receives less than the sender-covers case', () => {
    const covered = computeSettlement(priyaBase);
    expect(s.receiveAmount).toBeLessThan(covered.receiveAmount);
  });
});

describe('reQuote — rate expiry delta (§6c)', () => {
  const current = computeSettlement(priyaBase);
  const rq = reQuote(current, 83.071); // the mock expiry re-quote

  it('reports the recipient receiving less on a worse rate', () => {
    expect(rq.direction).toBe('less');
    expect(rq.receiveDelta).toBeLessThan(0);
  });

  it('delta equals the difference in converted amounts', () => {
    expect(rq.receiveDelta).toBeCloseTo(rq.next.receiveAmount - current.receiveAmount, 6);
    // 1200 * (83.071 - 83.215) = -172.8
    expect(rq.receiveDelta).toBeCloseTo(-172.8, 1);
  });
});

describe('walletImpact (§5C / §6b)', () => {
  it('reports sufficient balance and the after-amount', () => {
    const s = computeSettlement(priyaBase);
    const w = walletImpact(48220, s);
    expect(w.sufficient).toBe(true);
    expect(w.balanceAfterUsd).toBeCloseTo(47015.01, 2);
    expect(w.shortfallUsd).toBe(0);
  });

  it('reports the shortfall when the payout exceeds the balance', () => {
    const s = computeSettlement({ ...priyaBase, amountSendUsd: 6000, feeUsd: 1.99, rail: 'wallet' });
    const w = walletImpact(4220, s);
    expect(w.sufficient).toBe(false);
    // 6000 + 1.99 debit against 4220 balance -> 1781.99 short
    expect(w.shortfallUsd).toBeCloseTo(1781.99, 2);
  });
});
