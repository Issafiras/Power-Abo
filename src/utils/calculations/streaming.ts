/**
 * Streaming Calculations
 * 
 * Handles streaming coverage, CBB Mix compatibility, and streaming slot logic.
 */

import { getServiceById } from '../../data/streamingServices.js';
import { CartItem, CoverageResult, CBBMixCoverageResult, StreamingService } from './types.js';

/**
 * Check om streaming er inkluderet i valgte planer
 * @param cartItems - Array af kurv-items
 * @param selectedStreaming - Array af valgte streaming-ID'er
 * @returns { included: Array, notIncluded: Array }
 */
export function checkStreamingCoverage(cartItems: CartItem[] | null | undefined, selectedStreaming: string[] | null | undefined): CoverageResult {
    if (!selectedStreaming || selectedStreaming.length === 0) {
        return { included: [], notIncluded: [] };
    }

    if (!cartItems) {
        return { included: [], notIncluded: selectedStreaming };
    }

    // Hent alle inkluderede streaming-tjenester fra planer
    const includedStreaming = new Set<string>();
    let totalStreamingSlots = 0;

    cartItems.forEach(item => {
        if (item.plan.streaming && item.plan.streaming.length > 0) {
            // Hvis planen har specifikke streaming-tjenester
            item.plan.streaming.forEach(service => includedStreaming.add(service));
        }

        // Hvis planen har streamingCount (mix-system)
        if (item.plan.streamingCount && item.plan.streamingCount > 0) {
            totalStreamingSlots += item.plan.streamingCount * item.quantity;
        }
    });

    // Hvis der er streaming slots tilgængelige (mix-system)
    if (totalStreamingSlots > 0) {
        // Tag de første N streaming-tjenester (hvor N = totalStreamingSlots)
        const included = selectedStreaming.slice(0, totalStreamingSlots);
        const notIncluded = selectedStreaming.slice(totalStreamingSlots);

        return { included, notIncluded };
    }

    // Ellers brug den gamle logik (specifikke streaming-tjenester)
    const included = selectedStreaming.filter(id => includedStreaming.has(id));
    const notIncluded = selectedStreaming.filter(id => !includedStreaming.has(id));

    return { included, notIncluded };
}

/**
 * Check CBB MIX kompatibilitet
 * @param cartItems - Array af kurv-items
 * @returns { compatible: boolean, message: string }
 */
export function checkCBBMixCompatibility(cartItems: CartItem[] | null | undefined): { compatible: boolean; message?: string } {
    if (!cartItems) return { compatible: true };

    const hasCBBPlan = cartItems.some(item => item.plan.provider === 'cbb');
    const hasCBBMixPlan = cartItems.some(item => item.plan.cbbMixAvailable && item.cbbMixEnabled);

    if (hasCBBMixPlan && !hasCBBPlan) {
        return {
            compatible: false,
            message: 'CBB MIX kræver et CBB abonnement (min. 99 kr/md)'
        };
    }

    return { compatible: true };
}

/**
 * Beregn CBB MIX streaming coverage
 * @param cartItems - Array af kurv-items
 * @param selectedStreaming - Array af valgte streaming-ID'er
 * @returns { included: Array, notIncluded: Array, cbbMixSlots: number }
 */
export function checkCBBMixStreamingCoverage(cartItems: CartItem[] | null | undefined, selectedStreaming: string[] | null | undefined): CBBMixCoverageResult {
    if (!selectedStreaming || selectedStreaming.length === 0) {
        return { included: [], notIncluded: [], cbbMixSlots: 0 };
    }

    if (!cartItems) {
        return { included: [], notIncluded: selectedStreaming, cbbMixSlots: 0 };
    }

    let totalCBBMixSlots = 0;

    cartItems.forEach(item => {
        if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount && item.cbbMixCount > 0) {
            totalCBBMixSlots += item.cbbMixCount * item.quantity;
        }
    });

    // Hvis der er CBB MIX slots tilgængelige
    if (totalCBBMixSlots > 0) {
        // Filtrer tjenester der er ekskluderet fra CBB Mix (fx Disney+)
        const eligibleForMix = selectedStreaming.filter(id => {
            const service = getServiceById(id) as StreamingService | null;
            return service && !service.cbbMixExcluded;
        });

        const notEligibleForMix = selectedStreaming.filter(id => {
            const service = getServiceById(id) as StreamingService | null;
            return !service || service.cbbMixExcluded;
        });

        // Tag de første N streaming-tjenester fra de kvalificerede (hvor N = totalCBBMixSlots)
        const includedInMix = eligibleForMix.slice(0, totalCBBMixSlots);
        const remainingEligible = eligibleForMix.slice(totalCBBMixSlots);

        // Kombiner alt der ikke er inkluderet
        const notIncluded = [...notEligibleForMix, ...remainingEligible];

        return { included: includedInMix, notIncluded, cbbMixSlots: totalCBBMixSlots };
    }

    return { included: [], notIncluded: selectedStreaming, cbbMixSlots: 0 };
}

/**
 * Opdateret streaming coverage check med CBB MIX support
 * @param cartItems - Array af kurv-items
 * @param selectedStreaming - Array af valgte streaming-ID'er
 * @returns { included: Array, notIncluded: Array }
 */
export function checkStreamingCoverageWithCBBMix(cartItems: CartItem[] | null | undefined, selectedStreaming: string[] | null | undefined): CoverageResult {
    if (!selectedStreaming || selectedStreaming.length === 0) {
        return { included: [], notIncluded: [] };
    }

    if (!cartItems) {
        return { included: [], notIncluded: selectedStreaming };
    }

    // Hent alle inkluderede streaming-tjenester fra planer
    const includedStreaming = new Set<string>();
    let totalStreamingSlots = 0;

    cartItems.forEach(item => {
        if (item.plan.streaming && item.plan.streaming.length > 0) {
            // Hvis planen har specifikke streaming-tjenester
            item.plan.streaming.forEach(service => includedStreaming.add(service));
        }

        // Hvis planen har streamingCount (mix-system)
        if (item.plan.streamingCount && item.plan.streamingCount > 0) {
            totalStreamingSlots += item.plan.streamingCount * item.quantity;
        }

        // CBB MIX slots
        if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount && item.cbbMixCount > 0) {
            totalStreamingSlots += item.cbbMixCount * item.quantity;
        }
    });

    // Hvis der er streaming slots tilgængelige (mix-system)
    if (totalStreamingSlots > 0) {
        // Filtrer tjenester der er ekskluderet fra CBB Mix (fx Disney+)
        const eligibleForMix = selectedStreaming.filter(id => {
            const service = getServiceById(id) as StreamingService | null;
            return service && !service.cbbMixExcluded;
        });

        const notEligibleForMix = selectedStreaming.filter(id => {
            const service = getServiceById(id) as StreamingService | null;
            return !service || service.cbbMixExcluded;
        });

        // Tag de første N streaming-tjenester (hvor N = totalStreamingSlots)
        const includedInMix = eligibleForMix.slice(0, totalStreamingSlots);
        const remainingEligible = eligibleForMix.slice(totalStreamingSlots);

        // Kombiner alt der ikke er inkluderet
        const notIncluded = [...notEligibleForMix, ...remainingEligible];

        return { included: includedInMix, notIncluded };
    }

    // Ellers brug den gamle logik (specifikke streaming-tjenester)
    const included = selectedStreaming.filter(id => includedStreaming.has(id));
    const notIncluded = selectedStreaming.filter(id => !includedStreaming.has(id));

    return { included, notIncluded };
}
