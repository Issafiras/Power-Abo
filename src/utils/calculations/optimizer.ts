/**
 * Optimizer Logic (Refactored)
 * Contains the core algorithm for finding the best subscription solution.
 * OPTIMIZED VERSION: Telmore "Single Package" Rule, Weighted Scoring & Smart Fill-up
 */

import logger from '../logger.js';
import { calculateCustomerTotal, calculateOurOfferTotal, calculateSavings, calculateTotalEarnings } from './pricing.js';
import { checkStreamingCoverageWithCBBMix } from './streaming.js';
import { Plan, CartItem } from './types.js';

interface OptimizerOptions {
    requiredLines?: number;
    excludedProviders?: string[];
    enableTelmoreBoost?: boolean;
}

interface NormalizedOptions {
    requiredLines: number;
    excludedProviders: string[];
    enableTelmoreBoost: boolean;
}

interface SolutionResult {
    cartItems: CartItem[];
    explanation: string;
    savings: number;
    earnings: number;
}

const SCORING = {
    EARNINGS_WEIGHT: 1.0,
    SAVINGS_WEIGHT: 0.5,
    UPSELL_PENALTY_FACTOR: 2.0,
    FULL_COVERAGE_BONUS: 500,
    TELMORE_STREAMING_BONUS: 2000, // Prioritize Telmore for streaming (approx equal to 4000kr earnings diff)
    PENALTY_HUGE_LOSS: 10000
};

const HEURISTICS = {
    PRICE_THRESHOLD_FACTOR: 1.5, // Max price multiplier relative to current cost
    BROADBAND_COST_RATIO: 0.3,   // Estimated broadband portion of total cost
    MIN_MOBILE_COST_FOR_BROADBAND: 200, // Min mobile cost to consider broadband savings
    EXTRA_STREAMING_COST: 100,   // Estimated cost per missing streaming service
    DEFAULT_STREAMING_PRICE: 100, // Fallback streaming price
    BROADBAND_TERM_MONTHS: 6
};

/**
 * Validates and normalizes input options
 */
function normalizeOptions(options: OptimizerOptions): NormalizedOptions {
    const numberOfLines = (options.requiredLines && Number.isInteger(options.requiredLines) && options.requiredLines > 0) ? options.requiredLines : 1;
    return {
        requiredLines: numberOfLines,
        excludedProviders: options.excludedProviders || [],
        enableTelmoreBoost: options.enableTelmoreBoost !== false // Default to true
    };
}

/**
 * Filters available plans based on validity, expiration, and exclusions
 */
function filterValidPlans(availablePlans: Plan[] | null | undefined, excludedProviders: string[]) {
    if (!Array.isArray(availablePlans)) return { mobilePlans: [], broadbandPlans: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validPlans = availablePlans.filter(plan => {
        if (!plan || typeof plan !== 'object') return false;
        if (plan.business === true) return false;

        const earnings = (plan.earnings != null && Number.isFinite(plan.earnings)) ? plan.earnings : 0;
        if (earnings <= 0) return false;

        if (excludedProviders && excludedProviders.length > 0) {
            const planProvider = (plan.provider || '').toLowerCase();
            if (excludedProviders.some(ex => planProvider === ex.toLowerCase() || planProvider.startsWith(ex.toLowerCase() + '-'))) {
                return false;
            }
        }

        if (plan.expiresAt && !plan.campaignExpiresAt) {
            const exp = new Date(plan.expiresAt);
            if (today > exp) return false;
        }
        if (plan.availableFrom) { // assuming 'availableFrom' might exist on Plan based on logic, though not in interface yet? Added to interface implicitly if checked
             // Actually, I didn't add availableFrom to Plan interface. I should add it or use loose typing here. 
             // But Plan interface is open-ended? No.
             // Let's assume Plan interface matches checks. I'll add availableFrom to Plan in types.ts later if needed, but for now I'll cast or ignore if property missing.
             // Actually I'll use (plan as any).availableFrom to be safe for now or update interface. 
             // Plan interface in types.ts doesn't have availableFrom. I should add it.
             const availStr = (plan as any).availableFrom;
             if (availStr) {
                const avail = new Date(availStr);
                if (today < avail) return false;
            }
        }

        return true;
    });

    return {
        mobilePlans: validPlans.filter(plan => plan.type !== 'broadband'),
        broadbandPlans: validPlans.filter(plan => plan.type === 'broadband')
    };
}

/**
 * Creates the initial cart with the main plan configuration
 */
function createMainPlanConfig(mainPlan: Plan, selectedStreaming: string[], requiredLines: number) {
    const cart: CartItem[] = [];
    let streamingLinesUsed = 0;

    if (selectedStreaming.length > 0) {
        let slotsPerLine = 0;
        if (mainPlan.cbbMixAvailable) slotsPerLine = 8;
        else if (mainPlan.streamingCount) slotsPerLine = mainPlan.streamingCount;
        else if (mainPlan.streaming?.length) slotsPerLine = mainPlan.streaming.length;

        if (slotsPerLine > 0) {
            // CONSTRAINT: Only 1 streaming package (Master) per customer
            streamingLinesUsed = Math.min(1, requiredLines);

            if (mainPlan.cbbMixAvailable) {
                let optimalMixCount = Math.min(selectedStreaming.length, 6);
                if (optimalMixCount < 2) optimalMixCount = 2;
                
                if (mainPlan.cbbMixPricing && !mainPlan.cbbMixPricing[optimalMixCount]) {
                    optimalMixCount = 2; 
                }

                cart.push({
                    plan: mainPlan,
                    quantity: 1,
                    cbbMixEnabled: true,
                    cbbMixCount: optimalMixCount
                });
            } else {
                cart.push({
                    plan: mainPlan,
                    quantity: 1,
                    cbbMixEnabled: false,
                    cbbMixCount: 0
                });
            }
        }
    }

    return { cart, streamingLinesUsed };
}

/**
 * Identifies potential fill-up plans
 */
function getFillCandidates(mainPlan: Plan, voiceOnlyPlans: Plan[], linesRemaining: number): (Plan | null)[] {
    if (linesRemaining <= 0) return [null];

    const fillCandidates: (Plan | null)[] = [];
    const compatibleVoicePlans = voiceOnlyPlans.filter(p => p.provider === mainPlan.provider);
    fillCandidates.push(...compatibleVoicePlans);
    
    // Fallback to mainPlan if it can be voice-only
    if (mainPlan.cbbMixAvailable || (!mainPlan.streamingCount && (!mainPlan.streaming || mainPlan.streaming.length === 0))) {
        fillCandidates.push(mainPlan);
    }
    
    if (fillCandidates.length === 0) fillCandidates.push(mainPlan);
    
    // Deduplicate by ID
    const uniqueMap = new Map<string, Plan>();
    fillCandidates.forEach(item => {
        if (item) uniqueMap.set(item.id, item);
    });
    
    return Array.from(uniqueMap.values());
}

/**
 * Calculates the score for a specific solution
 */
function calculateSolutionScore(earnings: number, savings: number, notIncludedCount: number) {
    let score = earnings * SCORING.EARNINGS_WEIGHT;

    if (savings >= 0) {
        score += savings * SCORING.SAVINGS_WEIGHT;
    } else {
        score += savings * SCORING.UPSELL_PENALTY_FACTOR;
        if (savings < -500 && earnings < 2000) score -= SCORING.PENALTY_HUGE_LOSS;
    }

    if (notIncludedCount === 0) score += SCORING.FULL_COVERAGE_BONUS;

    return score;
}

type GetStreamingPriceFn = (id: string) => number;

/**
 * Find the best automatic solution for the customer
 */
export function findBestSolution(
    availablePlans: Plan[] | null | undefined, 
    selectedStreaming: string[] = [], 
    customerMobileCost: number = 0, 
    originalItemPrice: number = 0, 
    getStreamingPrice: GetStreamingPriceFn | null = null, 
    options: OptimizerOptions = {}
): SolutionResult {
    // Input validation
    const normalizedOptions = normalizeOptions(options);
    const validCustomerMobileCost = Number.isFinite(customerMobileCost) && customerMobileCost >= 0 ? customerMobileCost : 0;
    const validOriginalItemPrice = Number.isFinite(originalItemPrice) && originalItemPrice >= 0 ? originalItemPrice : 0;
    const validRequiredLines = normalizedOptions.requiredLines;

    const { mobilePlans, broadbandPlans } = filterValidPlans(availablePlans, normalizedOptions.excludedProviders);

    if (mobilePlans.length === 0) {
        return { cartItems: [], explanation: 'Ingen gyldige mobilplaner fundet', savings: 0, earnings: 0 };
    }

    // Calculate current customer state
    const getPrice = (typeof getStreamingPrice === 'function') ? getStreamingPrice : (() => HEURISTICS.DEFAULT_STREAMING_PRICE);
    const streamingCost = selectedStreaming.reduce((sum, id) => sum + (Number.isFinite(getPrice(id)) ? getPrice(id) : 0), 0);
    const customerTotal = calculateCustomerTotal(validCustomerMobileCost, streamingCost, validOriginalItemPrice);
    const validCustomerSixMonth = customerTotal.sixMonth || 0;

    // Pre-calculate voice only plans for fill-up strategy
    const voiceOnlyPlans = mobilePlans.filter(p => 
        !p.streamingCount && 
        !p.cbbMixAvailable && 
        (!p.streaming || p.streaming.length === 0)
    ).sort((a, b) => (b.earnings || 0) - (a.earnings || 0));

    let bestSolution: CartItem[] | null = null;
    let bestScore = -Infinity;
    let bestSavings = 0;
    let bestEarnings = 0;
    let bestExplanation = "";

    for (const mainPlan of mobilePlans) {
        try {
            // Optimization: Skip if main plan is much more expensive than current cost and no streaming needs
            if (selectedStreaming.length === 0 && mainPlan.price > (validCustomerMobileCost / validRequiredLines) * HEURISTICS.PRICE_THRESHOLD_FACTOR) {
                continue;
            }

            // Step 1: Configure Main Lines
            const { cart: tempCartStart } = createMainPlanConfig(mainPlan, selectedStreaming, validRequiredLines);
            
            const linesCovered = tempCartStart.reduce((sum, item) => sum + item.quantity, 0);
            const linesRemaining = validRequiredLines - linesCovered;

            if (linesRemaining < 0) continue;

            // Step 2: Fill-up Strategy
            const fillCandidates = getFillCandidates(mainPlan, voiceOnlyPlans, linesRemaining);

            for (const fillPlan of fillCandidates) {
                const testCart = [...tempCartStart]; // Shallow copy is fine as we push new objects

                if (linesRemaining > 0 && fillPlan) {
                    testCart.push({
                        plan: fillPlan,
                        quantity: linesRemaining,
                        cbbMixEnabled: false,
                        cbbMixCount: 0
                    });
                }

                // Step 3: Consider Broadband from same provider
                const mainProvider = mainPlan.provider;
                if (mainProvider && broadbandPlans.length > 0) {
                    const matchingBroadband = broadbandPlans.find(bb => {
                        if (mainProvider === 'telmore' && bb.id.includes('telmore')) return true;
                        if (mainProvider === 'telenor' && bb.id.includes('telenor')) return true;
                        return false;
                    });

                    if (matchingBroadband) {
                        const broadbandMonthlyCost = validCustomerMobileCost * HEURISTICS.BROADBAND_COST_RATIO;
                        const broadbandSavings = broadbandMonthlyCost * HEURISTICS.BROADBAND_TERM_MONTHS;
                        
                        if (broadbandSavings > (matchingBroadband.price * HEURISTICS.BROADBAND_TERM_MONTHS) || validCustomerMobileCost > HEURISTICS.MIN_MOBILE_COST_FOR_BROADBAND) {
                            testCart.push({
                                plan: matchingBroadband,
                                quantity: 1,
                                cbbMixEnabled: false,
                                cbbMixCount: 0
                            });
                        }
                    }
                }

                // Calculate Economics & Score
                const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
                const notIncludedCount = coverage.notIncluded.length;
                const extraStreamingCost = notIncludedCount * HEURISTICS.EXTRA_STREAMING_COST;

                const ourTotal = calculateOurOfferTotal(testCart, extraStreamingCost, 0, validOriginalItemPrice);
                if (!ourTotal) continue;

                const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) ? ourTotal.sixMonth : 0;
                const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
                const earnings = calculateTotalEarnings(testCart);

                if (earnings <= 0) continue;

                const score = calculateSolutionScore(earnings, savings, notIncludedCount);

                // STRATEGY: Prioritize Telmore for streaming customers
                // If streaming is selected, customer doesn't have Telmore (handled by excludedProviders),
                // and this is a Telmore plan -> Apply huge bonus
                let finalScore = score;
                if (normalizedOptions.enableTelmoreBoost && 
                    selectedStreaming.length > 0 && 
                    mainPlan.provider === 'telmore' &&
                    ((mainPlan.streamingCount || 0) > 0 || (mainPlan.streaming && mainPlan.streaming.length > 0))) {
                    
                    finalScore += SCORING.TELMORE_STREAMING_BONUS;
                    
                    // Log strategy application for quality assurance
                    if (import.meta.env.DEV) {
                        logger.debug('OPTIMIZER', `Applying Telmore Boost for ${mainPlan.name}`, {
                            baseScore: score,
                            finalScore,
                            savings,
                            earnings
                        });
                    }
                }

                if (finalScore > bestScore) {
                    bestScore = finalScore;
                    bestSolution = testCart;
                    bestSavings = savings;
                    bestEarnings = earnings;
                    
                    // Generate explanation
                    const mainName = mainPlan.name;
                    const fillName = (linesRemaining > 0 && fillPlan) ? fillPlan.name : '';
                    const mixInfo = (tempCartStart.length > 0 && tempCartStart[0].cbbMixEnabled) ? ` (Mix ${tempCartStart[0].cbbMixCount})` : '';
                    
                    const broadbandIncluded = testCart.some(item => item.plan.type === 'broadband');
                    // @ts-ignore
                    const broadbandName = broadbandIncluded ? testCart.find(item => item.plan.type === 'broadband').plan.name : '';

                    let explanation = `Anbefaling: ${mainName}${mixInfo}`;
                    if (linesRemaining > 0 && fillName && fillName !== mainName) {
                        explanation += ` + ${linesRemaining} stk ${fillName}`;
                    }
                    if (broadbandIncluded) {
                        explanation += ` + ${broadbandName}`;
                    }
                    bestExplanation = explanation;
                }
            }
        } catch (e) {
            logger.error('OPTIMIZER', `Fejl ved behandling af plan ${mainPlan.id}`, e);
            continue;
        }
    }

    if (!bestSolution || bestEarnings <= 0) {
        return {
            cartItems: [],
            explanation: 'Kunne ikke finde en optimal løsning med positiv indtjening.',
            savings: 0,
            earnings: 0
        };
    }

    return {
        cartItems: bestSolution,
        explanation: bestExplanation,
        savings: bestSavings,
        earnings: bestEarnings
    };
}
