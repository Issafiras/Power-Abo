import { describe, it, expect } from 'vitest';
import { calculateOurOfferTotal, calculateEffectiveHardwarePrice, calculateSavings } from './pricing';

describe('RePOWER (Trade-in) Flow', () => {
    it('should reduce the 6-month total by the buyback amount', () => {
        // Create a dummy plan with 0 cost to isolate hardware/buyback math
        const dummyPlan = { 
            id: 'dummy', 
            price: 0, 
            name: 'Dummy', 
            provider: 'test', 
            data: '0', 
            voice: '0' 
        };
        const cartItems = [{ plan: dummyPlan, quantity: 1 }];
        
        const streamingCost = 0;
        const cashDiscount = 0;
        const originalHardwarePrice = 8000;
        const buybackAmount = 2000;

        const result = calculateOurOfferTotal(
            cartItems,
            streamingCost,
            cashDiscount,
            originalHardwarePrice,
            buybackAmount
        );

        // Expected: 0 (subs) + 8000 (hardware) - 2000 (buyback) = 6000
        expect(result.sixMonth).toBe(6000);
    });

    it('should increase total savings by the buyback amount', () => {
        // Customer side: Pays 8000 for phone, 0 for subs (simplification)
        const customerTotal = 8000; 

        // Our side: Pays 6000 for phone (after 2000 buyback), 0 for subs
        const ourTotal = 6000;

        const savings = calculateSavings(customerTotal, ourTotal);
        
        expect(savings).toBe(2000);
    });

    it('should result in a lower effective hardware price', () => {
        const hardwarePrice = 8000;
        // Total savings from previous step (2000 from buyback + 0 from subs)
        const savings = 2000; 

        const effectivePrice = calculateEffectiveHardwarePrice(hardwarePrice, savings);

        // 8000 - 2000 = 6000
        expect(effectivePrice).toBe(6000);
    });

    it('should handle combined subscription savings and buyback', () => {
        // Scenario: 
        // Customer pays 1000 in subs (6mo) + 8000 hardware = 9000
        // We offer 500 in subs (6mo) + 8000 hardware - 2000 buyback = 6500
        
        const customerTotal = 9000;
        const ourTotal = 6500;
        const hardwarePrice = 8000;

        const savings = calculateSavings(customerTotal, ourTotal); // 2500
        expect(savings).toBe(2500);

        const effectivePrice = calculateEffectiveHardwarePrice(hardwarePrice, savings);
        // 8000 - 2500 = 5500
        expect(effectivePrice).toBe(5500);
    });
});
