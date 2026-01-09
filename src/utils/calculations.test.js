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
  calculateSixMonthPrice,
  findBestSolution
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

    const result = calculateOurOfferTotal(
      cartItems,
      notIncludedStreamingCost,
      cashDiscount,
      originalItemPrice
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
      0
    );

    const resultWithoutDiscount = calculateOurOfferTotal(
      cartItems,
      0,
      null,
      0
    );

    expect(resultWithDiscount.monthly).toBeLessThan(resultWithoutDiscount.monthly);
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

describe('findBestSolution - streaming match prioritization', () => {
  it('should prioritize higher earnings with weighted scoring (optimized algorithm)', () => {
    // Opret test planer: en med 2 streaming slots og en med 3 streaming slots
    // Den nye algoritme prioriterer indtjening med vægtet scoring frem for perfekt slot-match
    const availablePlans = [
      {
        id: 'test-2-streaming',
        provider: 'telmore',
        name: 'Test 2 Streaming',
        price: 299,
        earnings: 1000, // Lavere indtjening
        streamingCount: 2,
        features: []
      },
      {
        id: 'test-3-streaming',
        provider: 'telmore',
        name: 'Test 3 Streaming',
        price: 399,
        earnings: 1500, // Højere indtjening - bliver valgt med vægtet scoring
        streamingCount: 3,
        features: []
      },
      {
        id: 'test-voice-only',
        provider: 'telmore',
        name: 'Test Voice Only',
        price: 199,
        earnings: 800,
        streamingCount: 0,
        features: []
      }
    ];

    const selectedStreaming = ['netflix', 'viaplay']; // 2 streaming-tjenester
    const customerMobileCost = 299;
    const originalItemPrice = 0;

    const getStreamingPrice = (id) => {
      const prices = { netflix: 99, viaplay: 50 };
      return prices[id] || 0;
    };

    const result = findBestSolution(
      availablePlans,
      selectedStreaming,
      customerMobileCost,
      originalItemPrice,
      getStreamingPrice,
      {
        requiredLines: 1,
        maxLines: 5,
        excludedProviders: []
      }
    );

    // Verificer at resultatet vælger planen med højeste indtjening (3 streaming slots)
    expect(result.cartItems).toBeDefined();
    expect(result.cartItems.length).toBeGreaterThan(0);

    // Find den valgte streaming plan
    const streamingPlan = result.cartItems.find(item =>
      item.plan.streamingCount && item.plan.streamingCount > 0
    );

    // Den nye algoritme vælger planen med højere indtjening (1500 vs 1000)
    expect(streamingPlan).toBeDefined();
    expect(streamingPlan.plan.streamingCount).toBe(3);
    expect(streamingPlan.plan.id).toBe('test-3-streaming');
    expect(result.earnings).toBe(1500); // Højeste indtjening
  });

  it('should prioritize Telmore for streaming requests when not excluded', () => {
    // Scenario: Customer wants streaming.
    // Option A: CBB Mix (Good savings, decent earnings)
    // Option B: Telmore Play (Higher price/lower savings, but high strategic value)
    
    // We want the system to choose Telmore Play because of the strategic bonus
    const availablePlans = [
      {
        id: 'cbb-mix',
        provider: 'cbb',
        name: 'CBB Mix',
        price: 200,
        earnings: 800,
        cbbMixAvailable: true,
        features: []
      },
      {
        id: 'telmore-play',
        provider: 'telmore',
        name: 'Telmore Play',
        price: 250, // More expensive for customer
        earnings: 900, // Slightly better earnings, but normally savings might win
        streamingCount: 2,
        features: []
      }
    ];

    const selectedStreaming = ['netflix', 'tv2'];
    const customerMobileCost = 200; // Customer pays 200 today
    
    // CBB: Price 200 (Savings 0) + Earnings 800 -> Score ~ 800
    // Telmore: Price 250 (Savings -300 over 6mo) + Earnings 900 -> Score ~ 900 + (-300*2) = 300
    // Without bonus, CBB wins (800 > 300).
    // With bonus (+2000), Telmore wins (2300 > 800).

    const result = findBestSolution(
      availablePlans,
      selectedStreaming,
      customerMobileCost,
      0,
      () => 100,
      { requiredLines: 1 }
    );

    const chosenPlan = result.cartItems[0].plan;
    expect(chosenPlan.provider).toBe('telmore');
    expect(chosenPlan.id).toBe('telmore-play');
  });

  it('should NOT prioritize Telmore if excluded (customer already has it)', () => {
    const availablePlans = [
      {
        id: 'cbb-mix',
        provider: 'cbb',
        name: 'CBB Mix',
        price: 200,
        earnings: 800,
        cbbMixAvailable: true
      },
      {
        id: 'telmore-play',
        provider: 'telmore',
        name: 'Telmore Play',
        price: 250,
        earnings: 900,
        streamingCount: 2
      }
    ];

    const selectedStreaming = ['netflix'];
    
    // If Telmore is excluded, it shouldn't be chosen at all
    // But since it's the only plan with streaming, and we required streaming?
    // Wait, createMainPlanConfig handles streaming.
    // If selectedStreaming.length > 0, it tries to add streaming plan.
    // If no streaming capability, it might return empty cart?
    // CBB Mix DOES have streaming capability.
    // Why did it fail?
    // In createMainPlanConfig:
    // if (mainPlan.cbbMixAvailable) ...
    // It seems correct.
    
    // The issue might be that createMainPlanConfig checks cbbMixPricing[optimalMixCount].
    // Our mock CBB Mix plan doesn't have cbbMixPricing property!
    // So optimalMixCount stays at 2?
    // if (mainPlan.cbbMixPricing && !mainPlan.cbbMixPricing[optimalMixCount]) { optimalMixCount = 2; }
    // It handles missing cbbMixPricing by defaulting to 2? No, only if property exists but key missing.
    // If cbbMixPricing is undefined, it skips the check.
    // So cart should be created with cbbMixCount = 2 (if length >= 2) or 1?
    // optimalMixCount = Math.min(selectedStreaming.length, 6);
    // if < 2, optimalMixCount = 2.
    // So it should be fine.
    
    // Let's ensure our CBB Mix mock plan has necessary properties.
    const availablePlansUpdated = [
      {
        id: 'cbb-mix',
        provider: 'cbb',
        name: 'CBB Mix',
        price: 200,
        earnings: 800,
        cbbMixAvailable: true,
        cbbMixPricing: { 2: 250, 3: 300, 4: 350 }, // Added mock pricing
        features: []
      },
      {
        id: 'telmore-play',
        provider: 'telmore',
        name: 'Telmore Play',
        price: 250,
        earnings: 900,
        streamingCount: 2,
        features: []
      }
    ];

    const result = findBestSolution(
      availablePlansUpdated,
      selectedStreaming,
      200,
      0,
      () => 100,
      { 
        requiredLines: 1,
        excludedProviders: ['telmore']
      }
    );
    
    // Debug output if it fails again
    if (result.cartItems.length === 0) {
        console.log('STILL FAILING for CBB Mix. Result:', JSON.stringify(result));
    }

    expect(result.cartItems).toBeDefined();
    expect(result.cartItems.length).toBeGreaterThan(0);
    const chosenPlan = result.cartItems[0].plan;
    expect(chosenPlan.provider).toBe('cbb');
  });
});

