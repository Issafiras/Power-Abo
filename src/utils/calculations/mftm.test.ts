import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateTotalEarnings } from './pricing';
import { CAMPAIGN } from '../../constants/businessRules';

describe('MFTM Campaign Earnings', () => {
    beforeEach(() => {
        // Mock system time
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should NOT apply MFTM bonus before campaign start', () => {
        // Set date to Feb 5, 2026
        vi.setSystemTime(new Date('2026-02-05'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-149', provider: 'telmore', price: 149, earnings: 700 }, 
                quantity: 1 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        // Should only be base earnings
        expect(totalEarnings).toBe(700);
    });

    it('should apply 250 kr bonus during MFTM campaign (Feb 6-8, 2026)', () => {
        // Set date to Feb 6, 2026
        vi.setSystemTime(new Date('2026-02-06'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-149', provider: 'telmore', price: 149, earnings: 700 }, 
                quantity: 1 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        // Base 700 + Bonus 250 = 950
        expect(totalEarnings).toBe(950);
    });

    it('should apply bonus for multiple lines', () => {
        vi.setSystemTime(new Date('2026-02-07'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-149', provider: 'telmore', price: 149, earnings: 700 }, 
                quantity: 2 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        // (Base 700 + Bonus 250) * 2 = 1900
        expect(totalEarnings).toBe(1900);
    });

    it('should NOT apply bonus if price is below threshold (149 kr)', () => {
        vi.setSystemTime(new Date('2026-02-07'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-129', provider: 'telmore', price: 129, earnings: 400 }, 
                quantity: 1 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        expect(totalEarnings).toBe(400);
    });

    it('should NOT apply bonus after campaign end', () => {
        // Set date to Feb 9, 2026
        vi.setSystemTime(new Date('2026-02-09'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-149', provider: 'telmore', price: 149, earnings: 700 }, 
                quantity: 1 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        expect(totalEarnings).toBe(700);
    });

    it('should correctly handle mixed providers', () => {
        vi.setSystemTime(new Date('2026-02-07'));
        
        const cartItems = [
            { 
                plan: { id: 'telmore-149', provider: 'telmore', price: 149, earnings: 700 }, 
                quantity: 1 
            },
            { 
                plan: { id: 'cbb-99', provider: 'cbb', price: 99, earnings: 400 }, 
                quantity: 1 
            }
        ];
        
        const totalEarnings = calculateTotalEarnings(cartItems);
        // Telmore (700+250) + CBB (400) = 1350
        // Wait, check pricing.ts - CBB might have CBB_BASE_EARNINGS (currently 0 in businessRules.js)
        expect(totalEarnings).toBe(1350);
    });
});
