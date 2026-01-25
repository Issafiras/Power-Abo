import { describe, it, expect } from 'vitest';
import { calculateEffectiveHardwarePrice } from './pricing';

describe('Hardware Price Calculations', () => {
  it('should calculate effective price correctly when there is a saving', () => {
    const hardwarePrice = 8000;
    const savings = 3000;
    // 8000 - 3000 = 5000
    expect(calculateEffectiveHardwarePrice(hardwarePrice, savings)).toBe(5000);
  });

  it('should handle negative savings (additional cost)', () => {
    const hardwarePrice = 8000;
    const savings = -1000; // Customer pays 1000 more
    // 8000 - (-1000) = 9000
    expect(calculateEffectiveHardwarePrice(hardwarePrice, savings)).toBe(9000);
  });

  it('should handle zero hardware price (no hardware)', () => {
    const hardwarePrice = 0;
    const savings = 3000;
    // 0 - 3000 = -3000 (Technically correct math, but logically means you earn 3000)
    expect(calculateEffectiveHardwarePrice(hardwarePrice, savings)).toBe(-3000);
  });

  it('should handle zero savings', () => {
    const hardwarePrice = 5000;
    const savings = 0;
    expect(calculateEffectiveHardwarePrice(hardwarePrice, savings)).toBe(5000);
  });
});
