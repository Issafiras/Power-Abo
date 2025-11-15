/**
 * Tests for calculations.js
 * Kritiske tests for beregningslogik
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateCustomerTotal,
  calculateOurOfferTotal,
  calculateSavings,
  calculateTelenorFamilyDiscount,
  checkStreamingCoverage,
  calculateSixMonthPrice
} from './calculations';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    // formatCurrency returns currency format (kr. suffix)
    expect(formatCurrency(123)).toContain('123');
    expect(formatCurrency(1234)).toContain('1.234');
    expect(formatCurrency(12345)).toContain('12.345');
    expect(formatCurrency(123456)).toContain('123.456');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('should format decimals correctly (rounded)', () => {
    // formatCurrency rounds to nearest integer
    expect(formatCurrency(123.45)).toContain('123');
    expect(formatCurrency(123.99)).toContain('124'); // Rounds up to 124
    expect(formatCurrency(123.5)).toContain('124'); // Rounds up
  });

  it('should include currency symbol', () => {
    const result = formatCurrency(100);
    expect(result).toMatch(/kr|DKK/);
  });
});

describe('calculateSixMonthPrice', () => {
  it('should calculate 6 month price correctly', () => {
    const plan = { price: 299 };
    expect(calculateSixMonthPrice(plan, 1)).toBe(1794);
    expect(calculateSixMonthPrice(plan, 2)).toBe(3588);
  });

  it('should handle zero quantity', () => {
    const plan = { price: 299 };
    expect(calculateSixMonthPrice(plan, 0)).toBe(0);
  });
});

describe('calculateTelenorFamilyDiscount', () => {
  it('should calculate discount for 2+ Telenor plans with familyDiscount', () => {
    const cartItems = [
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 },
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 }
    ];
    const discount = calculateTelenorFamilyDiscount(cartItems);
    // 2 lines: (2 - 1) * 50 = 50
    expect(discount).toBe(50);
  });

  it('should calculate discount for 3+ Telenor plans with familyDiscount', () => {
    const cartItems = [
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 },
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 },
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 }
    ];
    const discount = calculateTelenorFamilyDiscount(cartItems);
    // 3 lines: (3 - 1) * 50 = 100
    expect(discount).toBe(100);
  });

  it('should return 0 for single Telenor plan', () => {
    const cartItems = [
      { plan: { provider: 'telenor', familyDiscount: true }, quantity: 1 }
    ];
    const discount = calculateTelenorFamilyDiscount(cartItems);
    expect(discount).toBe(0);
  });

  it('should return 0 for Telenor plans without familyDiscount flag', () => {
    const cartItems = [
      { plan: { provider: 'telenor' }, quantity: 1 },
      { plan: { provider: 'telenor' }, quantity: 1 }
    ];
    const discount = calculateTelenorFamilyDiscount(cartItems);
    expect(discount).toBe(0);
  });

  it('should return 0 for non-Telenor plans', () => {
    const cartItems = [
      { plan: { provider: 'telmore', price: 299 }, quantity: 1 }
    ];
    const discount = calculateTelenorFamilyDiscount(cartItems);
    expect(discount).toBe(0);
  });
});

describe('calculateCustomerTotal', () => {
  it('should calculate customer total correctly', () => {
    const customerMobileCost = 299;
    const streamingCost = 99;
    const originalItemPrice = 1000;

    const result = calculateCustomerTotal(customerMobileCost, streamingCost, originalItemPrice);
    
    expect(result.monthly).toBe(398); // 299 + 99
    expect(result.sixMonth).toBe(3388); // (398 * 6) + 1000
  });

  it('should handle zero values', () => {
    const result = calculateCustomerTotal(0, 0, 0);
    expect(result.monthly).toBe(0);
    expect(result.sixMonth).toBe(0);
  });
});

describe('calculateOurOfferTotal', () => {
  it('should calculate our offer total correctly', () => {
    const cartItems = [
      { plan: { price: 299 }, quantity: 1 }
    ];
    const notIncludedStreamingCost = 0;
    const cashDiscount = null;
    const originalItemPrice = 0;
    const freeSetup = false;

    const result = calculateOurOfferTotal(
      cartItems,
      notIncludedStreamingCost,
      cashDiscount,
      originalItemPrice,
      freeSetup
    );

    expect(result.monthly).toBeGreaterThan(0);
    expect(result.sixMonth).toBeGreaterThan(0);
  });

  it('should apply cash discount when provided', () => {
    const cartItems = [
      { plan: { price: 299 }, quantity: 1 }
    ];
    const cashDiscount = 50;

    const resultWithDiscount = calculateOurOfferTotal(
      cartItems,
      0,
      cashDiscount,
      0,
      false
    );

    const resultWithoutDiscount = calculateOurOfferTotal(
      cartItems,
      0,
      null,
      0,
      false
    );

    expect(resultWithDiscount.monthly).toBeLessThan(resultWithoutDiscount.monthly);
  });

  it('should handle free setup', () => {
    const cartItems = [
      { plan: { price: 299 }, quantity: 1 }
    ];

    const resultWithSetup = calculateOurOfferTotal(
      cartItems,
      0,
      null,
      0,
      true
    );

    const resultWithoutSetup = calculateOurOfferTotal(
      cartItems,
      0,
      null,
      0,
      false
    );

    // Free setup should have setupFeeDiscount equal to setupFee
    expect(resultWithSetup.setupFeeDiscount).toBe(resultWithSetup.setupFee);
    expect(resultWithoutSetup.setupFeeDiscount).toBe(0);
    expect(resultWithSetup.sixMonth).toBeLessThan(resultWithoutSetup.sixMonth);
  });
});

describe('calculateSavings', () => {
  it('should calculate positive savings correctly', () => {
    const customerTotal = 5000;
    const ourOfferTotal = 4000;
    const savings = calculateSavings(customerTotal, ourOfferTotal);
    expect(savings).toBe(1000);
  });

  it('should calculate negative savings (loss) correctly', () => {
    const customerTotal = 4000;
    const ourOfferTotal = 5000;
    const savings = calculateSavings(customerTotal, ourOfferTotal);
    expect(savings).toBe(-1000);
  });

  it('should return zero when totals are equal', () => {
    const savings = calculateSavings(5000, 5000);
    expect(savings).toBe(0);
  });
});

describe('checkStreamingCoverage', () => {
  it('should identify included streaming services', () => {
    const cartItems = [
      { 
        plan: { 
          name: 'Test Plan',
          streaming: ['netflix', 'viaplay'],
          quantity: 1
        },
        quantity: 1
      }
    ];
    const selectedStreaming = ['netflix', 'viaplay', 'disney'];

    const result = checkStreamingCoverage(cartItems, selectedStreaming);

    expect(result.included).toContain('netflix');
    expect(result.included).toContain('viaplay');
    expect(result.notIncluded).toContain('disney');
  });

  it('should handle streamingCount (mix system)', () => {
    const cartItems = [
      { 
        plan: { 
          name: 'Test Plan',
          streamingCount: 2
        },
        quantity: 1
      }
    ];
    const selectedStreaming = ['netflix', 'viaplay', 'disney'];

    const result = checkStreamingCoverage(cartItems, selectedStreaming);

    expect(result.included.length).toBe(2);
    expect(result.notIncluded.length).toBe(1);
  });

  it('should handle empty arrays', () => {
    const result = checkStreamingCoverage([], []);
    expect(result.included).toEqual([]);
    expect(result.notIncluded).toEqual([]);
  });

  it('should handle plans without streaming included', () => {
    const cartItems = [
      { 
        plan: {
          name: 'Test Plan'
        },
        quantity: 1
      }
    ];
    const selectedStreaming = ['netflix'];

    const result = checkStreamingCoverage(cartItems, selectedStreaming);
    expect(result.notIncluded).toContain('netflix');
  });
});

