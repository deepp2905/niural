import { describe, it, expect } from 'vitest';
import {
  groupIndian,
  formatINR,
  formatUSD,
  formatMoney,
  formatRate,
  formatCountdown,
} from './format';

describe('groupIndian (2,2,3 grouping)', () => {
  it('leaves <=3 digits ungrouped', () => {
    expect(groupIndian('0')).toBe('0');
    expect(groupIndian('99')).toBe('99');
    expect(groupIndian('999')).toBe('999');
  });

  it('groups the last three, then twos', () => {
    expect(groupIndian('99447')).toBe('99,447');
    expect(groupIndian('159000')).toBe('1,59,000');
    expect(groupIndian('1234567')).toBe('12,34,567');
    expect(groupIndian('10000000')).toBe('1,00,00,000'); // one crore
  });

  it('handles a negative sign', () => {
    expect(groupIndian('-159000')).toBe('-1,59,000');
  });
});

describe('formatINR', () => {
  it('formats the hero amount with paise', () => {
    expect(formatINR(99447.24)).toBe('₹99,447.24');
  });

  it('rounds to whole rupees when decimals: 0', () => {
    expect(formatINR(99447.24, { decimals: 0 })).toBe('₹99,447');
  });

  it('applies lakh grouping at scale', () => {
    expect(formatINR(159000, { decimals: 0 })).toBe('₹1,59,000');
  });
});

describe('formatUSD', () => {
  it('formats with Western grouping and two decimals', () => {
    expect(formatUSD(1204.99)).toBe('$1,204.99');
    expect(formatUSD(48220)).toBe('$48,220.00');
  });

  it('renders a signed delta', () => {
    expect(formatUSD(41.3, { signed: true })).toBe('+$41.30');
    expect(formatUSD(-1780)).toBe('-$1,780.00');
  });
});

describe('formatMoney USDC', () => {
  it('appends the USDC code', () => {
    expect(formatMoney(2000, 'USDC')).toBe('2,000.00 USDC');
  });
});

describe('formatRate / formatCountdown', () => {
  it('formats a rate to four decimals', () => {
    expect(formatRate(83.215)).toBe('83.2150');
  });

  it('formats a countdown as mm:ss', () => {
    expect(formatCountdown(900)).toBe('15:00');
    expect(formatCountdown(59)).toBe('0:59');
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(-5)).toBe('0:00');
  });
});
