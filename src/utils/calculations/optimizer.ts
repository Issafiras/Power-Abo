/**
 * Optimizer Logic (Advanced Combinatorial)
 * Implements a smart solver for finding the optimal subscription bundle.
 * Features:
 * - Provider-specific optimization strategies
 * - Combinatorial check for small families (guarantees best mix)
 * - Intelligent weighing of Earnings vs Customer Savings
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
    EARNINGS_WEIGHT: 1.2,        // Earnings are slightly more important than raw savings match
    SAVINGS_WEIGHT: 0.8,
    UPSELL_PENALTY_FACTOR: 3.0,  // High penalty for costing the customer MORE than they pay now
    FULL_COVERAGE_BONUS: 1000,
    TELMORE_STREAMING_BONUS: 2500, // Strong bias for Telmore Play when streaming is involved
    PENALTY_HUGE_LOSS: 20000     // Massive penalty for bad deals
};

const HEURISTICS = {
    PRICE_THRESHOLD_FACTOR: 1.8,
    BROADBAND_COST_RATIO: 0.3,
    MIN_MOBILE_COST_FOR_BROADBAND: 150,
    EXTRA_STREAMING_COST: 129,
    DEFAULT_STREAMING_PRICE: 99,
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
        enableTelmoreBoost: options.enableTelmoreBoost !== false
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

        // Skip plan if no earnings (unless it's a strategically necessary loss-leader, but usually we want earnings)
        if ((plan.earnings || 0) <= 0) return false;

        // Exclusion check
        if (excludedProviders && excludedProviders.length > 0) {
            const planProvider = (plan.provider || '').toLowerCase();
            if (excludedProviders.some(ex => planProvider === ex.toLowerCase() || planProvider.startsWith(ex.toLowerCase() + '-'))) {
                return false;
            }
        }

        // Expiration check
        if (plan.expiresAt && !plan.campaignExpiresAt) {
            const exp = new Date(plan.expiresAt);
            if (today > exp) return false;
        }

        // Availability check
        if (plan.availableFrom) {
            const avail = new Date(plan.availableFrom);
            if (today < avail) return false;
        }

        return true;
    });

    return {
        mobilePlans: validPlans.filter(plan => plan.type !== 'broadband'),
        broadbandPlans: validPlans.filter(plan => plan.type === 'broadband')
    };
}

/**
 * Creates a configured cart item for a plan
 */
function createCartItem(plan: Plan, quantity: number, streamingNeeds: string[]): CartItem {
    let mixEnabled = false;
    let mixCount = 0;

    // Intelligent CBB Mix activation
    if (plan.cbbMixAvailable && streamingNeeds.length >= 2) {
        mixEnabled = true;
        // Find optimal mix count (2-6 usually)
        // We cap at 6 because >6 is rare and often better served by other packages
        const needed = Math.min(streamingNeeds.length, 6);
        mixCount = Math.max(2, needed);
    }

    return {
        plan,
        quantity,
        cbbMixEnabled: mixEnabled,
        cbbMixCount: mixCount
    };
}

/**
 * Combinatorial Solver for a specific Provider
 * Tries to find the best combination of plans for this provider to satisfy requirements
 */
function findBestProviderBundle(
    provider: string,
    providerPlans: Plan[],
    broadbandPlans: Plan[],
    requiredLines: number,
    selectedStreaming: string[],
    customerData: { mobileCost: number, itemPrice: number },
    options: NormalizedOptions
) {
    // 1. Separate into "Masters" (Streaming/High Data) and "Slaves" (Cheap/Fillers)
    // A Master is any plan that offers streaming OR is the most expensive plan (Fri Data)
    const masters = providerPlans.filter(p =>
        (p.streamingCount && p.streamingCount > 0) ||
        (p.streaming && p.streaming.length > 0) ||
        p.cbbMixAvailable ||
        (p.data?.toLowerCase?.().includes('fri data') ?? false) ||
        p.price >= 169
    );

    // Slaves are cheap plans good for filling lines
    const slaves = providerPlans.filter(p => p.price < 169 && !p.cbbMixAvailable).sort((a, b) => a.price - b.price);

    // Always include all plans as potential single-line solutions
    if (requiredLines === 1) {
        masters.push(...providerPlans);
    }

    let bestBundleScore = -Infinity;
    let bestBundle: CartItem[] | null = null;

    // Strategy A: 1 Master + (N-1) Slaves (Classic Family Setup)
    // We iterate briefly through top masters and top slaves
    const candidateMasters = masters.length > 0 ? masters : providerPlans;
    const candidateSlaves = slaves.length > 0 ? slaves : providerPlans;

    // Limit iterations for performance
    const topMasters = candidateMasters.slice(0, 5);
    const topSlaves = candidateSlaves.slice(0, 3); // Check 3 cheapest fillers

    for (const master of topMasters) {
        // Try different fillers
        for (const slave of (requiredLines > 1 ? topSlaves : [master])) {
            // Case 1: Master handles streaming
            const cart: CartItem[] = [];

            // Add Master (1 line)
            cart.push(createCartItem(master, 1, selectedStreaming));

            // Add Fillers (N-1 lines)
            if (requiredLines > 1) {
                // Determine if we use the SAME slave for all, or if we can optimize?
                // For simplicity and "Samlerabat", usage of same filler is standard.
                // Exception: if Master IS the filler (e.g. 2x Cheap Plan)
                const filler = (requiredLines === 1) ? null : slave;
                if (filler) {
                    // Check if filler is same as master, just inc quantity
                    if (filler.id === master.id) {
                        cart[0].quantity += (requiredLines - 1);
                    } else {
                        cart.push(createCartItem(filler, requiredLines - 1, []));
                    }
                }
            }

            // Optional: Broadband
            // Heuristic: If we are saving money on mobile, maybe we can add broadband?
            // Or if customer *already* pays for broadband.
            // Current algorithm just checks if adding broadband is "Good" (Positive Savings).
            const relevantBroadband = broadbandPlans.find(b => b.provider === 'broadband' || b.id.includes(provider));

            // We test TWO variants: With and Without Broadband (if strictly profitable)
            const variants = [cart];
            if (relevantBroadband) {
                const cartWithBB = JSON.parse(JSON.stringify(cart));
                cartWithBB.push(createCartItem(relevantBroadband, 1, []));
                variants.push(cartWithBB);
            }

            for (const testCart of variants) {
                const score = evaluateBundle(testCart, selectedStreaming, customerData, options);
                if (score.score > bestBundleScore) {
                    bestBundleScore = score.score;
                    bestBundle = testCart;
                }
            }
        }
    }

    return { score: bestBundleScore, cart: bestBundle };
}

/**
 * Evaluates a specific cart bundle against the customer's needs
 */
function evaluateBundle(
    cart: CartItem[],
    selectedStreaming: string[],
    customerData: { mobileCost: number, itemPrice: number },
    options: NormalizedOptions
) {
    const coverage = checkStreamingCoverageWithCBBMix(cart, selectedStreaming);
    const notIncludedCount = coverage.notIncluded.length;
    const extraStreamingCost = notIncludedCount * HEURISTICS.EXTRA_STREAMING_COST; // Shadow cost for missing services

    const ourTotal = calculateOurOfferTotal(cart, extraStreamingCost, 0, customerData.itemPrice);
    if (!ourTotal) return { score: -Infinity };

    const customerTotal6Months = calculateCustomerTotal(customerData.mobileCost,
        selectedStreaming.length * HEURISTICS.DEFAULT_STREAMING_PRICE, // Estimated streaming cost if unknown
        customerData.itemPrice
    ).sixMonth;

    const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) ? ourTotal.sixMonth : 0;
    const savings = calculateSavings(customerTotal6Months, validOurSixMonth);
    const earnings = calculateTotalEarnings(cart);

    if (earnings <= 0) return { score: -Infinity };

    // Scoring Formula
    let score = (earnings * SCORING.EARNINGS_WEIGHT) + (savings * SCORING.SAVINGS_WEIGHT);

    // Penalties / Bonuses
    if (savings < 0) score -= (Math.abs(savings) * SCORING.UPSELL_PENALTY_FACTOR);
    if (notIncludedCount === 0) score += SCORING.FULL_COVERAGE_BONUS;

    // Provider Specific Boosts
    const mainPlan = cart[0].plan;
    if (options.enableTelmoreBoost && mainPlan.provider === 'telmore' && selectedStreaming.length > 0) {
        // Strong boost for Telmore Play when streaming is needed
        // Assuming Telmore Play bundles are high quality
        if (mainPlan.name.includes('Play') || mainPlan.streamingCount! > 0) {
            score += SCORING.TELMORE_STREAMING_BONUS;
        }
    }

    return { score, earnings, savings };
}

/**
 * Find the best automatic solution for the customer
 */
export function findBestSolution(
    availablePlans: Plan[] | null | undefined,
    selectedStreaming: string[] = [],
    customerMobileCost: number = 0,
    originalItemPrice: number = 0,
    getStreamingPrice: any = null, // Type ignored for now as we estimate
    options: OptimizerOptions = {}
): SolutionResult {
    const normalizedOptions = normalizeOptions(options);

    // 1. Filter Plans
    const { mobilePlans, broadbandPlans } = filterValidPlans(availablePlans, normalizedOptions.excludedProviders);
    if (mobilePlans.length === 0) {
        return { cartItems: [], explanation: 'Ingen gyldige planer fundet', savings: 0, earnings: 0 };
    }

    // 2. Group by Provider
    const telmorePlans = mobilePlans.filter(p => p.provider === 'telmore');
    const telenorPlans = mobilePlans.filter(p => p.provider === 'telenor');
    const cbbPlans = mobilePlans.filter(p => p.provider === 'cbb');

    // 3. Run Solver for each Provider
    const bestTelmore = findBestProviderBundle('telmore', telmorePlans, broadbandPlans, normalizedOptions.requiredLines, selectedStreaming, { mobileCost: customerMobileCost, itemPrice: originalItemPrice }, normalizedOptions);
    const bestTelenor = findBestProviderBundle('telenor', telenorPlans, broadbandPlans, normalizedOptions.requiredLines, selectedStreaming, { mobileCost: customerMobileCost, itemPrice: originalItemPrice }, normalizedOptions);
    const bestCBB = findBestProviderBundle('cbb', cbbPlans, broadbandPlans, normalizedOptions.requiredLines, selectedStreaming, { mobileCost: customerMobileCost, itemPrice: originalItemPrice }, normalizedOptions);

    // 4. Compare Results
    const candidates = [
        { ...bestTelmore, name: 'Telmore' },
        { ...bestTelenor, name: 'Telenor' },
        { ...bestCBB, name: 'CBB' }
    ].filter(r => r.cart !== null && r.score > -Infinity);

    if (candidates.length === 0) {
        return { cartItems: [], explanation: 'Kunne ikke finde en løsning', savings: 0, earnings: 0 };
    }

    // Sort by Score with Telmore preference on tie
    candidates.sort((a, b) => {
        // If scores are very close (within 100 points, approx 100kr earnings value), prefer Telmore
        // Score is roughly 1.0 * Earnings.
        if (Math.abs(a.score - b.score) < 120) {
            if (a.name === 'Telmore' && b.name !== 'Telmore') return -1;
            if (b.name === 'Telmore' && a.name !== 'Telmore') return 1;
        }
        return b.score - a.score;
    });
    const winner = candidates[0];

    // 5. Finalize Result
    const cartItems = winner.cart!;

    // Generate Explanation
    const mainPlan = cartItems[0].plan;
    const providerName = mainPlan.provider.charAt(0).toUpperCase() + mainPlan.provider.slice(1);
    let explanation = `Bedste løsning: ${providerName}`;

    if (selectedStreaming.length > 0) {
        explanation += ` dækker ${selectedStreaming.length} streaming-tjenester`;
    }

    // Calculate final metrics for the winning bundle
    const evaluation = evaluateBundle(cartItems, selectedStreaming, { mobileCost: customerMobileCost, itemPrice: originalItemPrice }, normalizedOptions);

    return {
        cartItems: cartItems,
        explanation: explanation,
        savings: evaluation.savings || 0,
        earnings: evaluation.earnings || 0
    };
}
