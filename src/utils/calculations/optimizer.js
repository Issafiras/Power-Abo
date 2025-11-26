/**
 * Optimizer Logic
 * * Contains the core algorithm for finding the best subscription solution.
 * OPTIMIZED VERSION: Telmore "Single Package" Rule, Weighted Scoring & Smart Fill-up
 */

import logger from '../logger.js';
import { calculateCustomerTotal, calculateOurOfferTotal, calculateSavings, calculateTotalEarnings } from './pricing.js';
import { checkStreamingCoverageWithCBBMix } from './streaming.js';

/**
 * Find den bedste automatiske løsning for kunden
 * @param {Array} availablePlans - Alle tilgængelige planer
 * @param {Array} selectedStreaming - Valgte streaming-tjenester
 * @param {number} customerMobileCost - Kundens nuværende mobiludgifter
 * @param {number} originalItemPrice - Varens pris inden rabat
 * @param {Function} getStreamingPrice - Funktion der returnerer pris for en streaming-tjeneste
 * @param {Object} options - Yderligere indstillinger
 * @returns {Object} { cartItems: Array, explanation: string, savings: number, earnings: number }
 */
export function findBestSolution(availablePlans, selectedStreaming = [], customerMobileCost = 0, originalItemPrice = 0, getStreamingPrice = null, options = {}) {
    // ===== INPUT VALIDERING =====

    if (!Array.isArray(availablePlans) || availablePlans.length === 0) {
        return { cartItems: [], explanation: 'Ingen tilgængelige planer fundet', savings: 0, earnings: 0 };
    }

    selectedStreaming = Array.isArray(selectedStreaming) ? selectedStreaming : [];
    
    // Options normalisering
    const numberOfLines = Number.isInteger(options.requiredLines) && options.requiredLines > 0 ? options.requiredLines : 1;
    const {
        requiredLines = numberOfLines,
        excludedProviders = []
    } = options || {};

    const validRequiredLines = Number.isInteger(requiredLines) && requiredLines > 0 && requiredLines <= 20 ? requiredLines : 1;
    const validCustomerMobileCost = Number.isFinite(customerMobileCost) && customerMobileCost >= 0 ? customerMobileCost : 0;
    const validOriginalItemPrice = Number.isFinite(originalItemPrice) && originalItemPrice >= 0 ? originalItemPrice : 0;

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrer og valider planer - separer mobil og bredbånd
    const allValidPlans = availablePlans.filter(plan => {
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
        if (plan.availableFrom) {
            const avail = new Date(plan.availableFrom);
            if (today < avail) return false;
        }

        return true;
    });

    // Separer mobil og bredbånd planer
    const mobilePlans = allValidPlans.filter(plan => plan.type !== 'broadband');
    const broadbandPlans = allValidPlans.filter(plan => plan.type === 'broadband');

    if (mobilePlans.length === 0) {
        return { cartItems: [], explanation: 'Ingen gyldige mobilplaner fundet', savings: 0, earnings: 0 };
    }

    // Beregn nuværende streaming-omkostninger
    const getPrice = (typeof getStreamingPrice === 'function') ? getStreamingPrice : (() => 100);
    const streamingCost = selectedStreaming.reduce((sum, id) => sum + (Number.isFinite(getPrice(id)) ? getPrice(id) : 0), 0);
    const customerTotal = calculateCustomerTotal(validCustomerMobileCost, streamingCost, validOriginalItemPrice);
    const validCustomerSixMonth = customerTotal.sixMonth || 0;

    // === SCORE VÆGTNING ===

    const EARNINGS_WEIGHT = 1.0;
    const SAVINGS_WEIGHT = 0.5;
    const UPSELL_PENALTY_FACTOR = 2.0;
    const FULL_COVERAGE_BONUS = 500;

    // Find "Voice Only" planer til opfyldning
    const voiceOnlyPlans = mobilePlans.filter(p => 
        !p.streamingCount && 
        !p.cbbMixAvailable && 
        (!p.streaming || p.streaming.length === 0)
    ).sort((a, b) => (b.earnings || 0) - (a.earnings || 0));

    let bestSolution = null;
    let bestScore = -Infinity;
    let bestSavings = 0;
    let bestEarnings = 0;
    let bestExplanation = "";

    for (const mainPlan of mobilePlans) {
        try {
            // Optimering: Skip hvis hovedplanen er meget dyrere end kundens nuværende og vi ikke har streaming behov
            if (selectedStreaming.length === 0 && mainPlan.price > (validCustomerMobileCost / validRequiredLines) * 1.5) {
                continue;
            }

            // === TRIN 1: Konfigurer Hoved-linjer ===

            const tempCartStart = [];
            let streamingLinesUsed = 0;

            if (selectedStreaming.length > 0) {
                let slotsPerLine = 0;
                if (mainPlan.cbbMixAvailable) slotsPerLine = 8;
                else if (mainPlan.streamingCount) slotsPerLine = mainPlan.streamingCount;
                else if (mainPlan.streaming?.length) slotsPerLine = mainPlan.streaming.length;

                if (slotsPerLine > 0) {
                    // CONSTRAINT: Telmore/General Regel.
                    // Vi tillader kun 1 streaming-pakke (Master) pr. kunde/løsning.
                    // Vi forsøger ikke at "stakke" abonnementer for at dække flere tjenester.
                    streamingLinesUsed = Math.min(1, validRequiredLines);

                    if (mainPlan.cbbMixAvailable) {
                        // CBB MIX
                        let optimalMixCount = Math.min(selectedStreaming.length, 6);
                        if (optimalMixCount < 2) optimalMixCount = 2;
                        
                        if (mainPlan.cbbMixPricing && !mainPlan.cbbMixPricing[optimalMixCount]) {
                            optimalMixCount = 2; 
                        }

                        tempCartStart.push({
                            plan: mainPlan,
                            quantity: 1,
                            cbbMixEnabled: true,
                            cbbMixCount: optimalMixCount
                        });
                    } else {
                        // STANDARD STREAMING (Telmore/Telenor)
                        // Vi tilføjer kun 1 linje. Hvis denne plan ikke dækker alle tjenester,
                        // vil coverage-beregningen nedenfor straffe scoren, så en større plan vinder.
                        tempCartStart.push({
                            plan: mainPlan,
                            quantity: 1,
                            cbbMixEnabled: false,
                            cbbMixCount: 0
                        });
                    }
                }
            }

            // === TRIN 2: Fill-up Strategi ===

            const linesCovered = tempCartStart.reduce((sum, item) => sum + item.quantity, 0);
            const linesRemaining = validRequiredLines - linesCovered;

            if (linesRemaining < 0) continue;

            let fillCandidates = [];
            if (linesRemaining > 0) {
                const compatibleVoicePlans = voiceOnlyPlans.filter(p => p.provider === mainPlan.provider);
                fillCandidates.push(...compatibleVoicePlans);
                
                // Fallback til mainPlan hvis den kan køre voice-only
                if (mainPlan.cbbMixAvailable || (!mainPlan.streamingCount && (!mainPlan.streaming || mainPlan.streaming.length === 0))) {
                    fillCandidates.push(mainPlan);
                }
                
                if (fillCandidates.length === 0) fillCandidates.push(mainPlan);
                fillCandidates = [...new Map(fillCandidates.map(item => [item.id, item])).values()];
            } else {
                fillCandidates = [null];
            }

            for (const fillPlan of fillCandidates) {
                const testCart = [...tempCartStart];

                if (linesRemaining > 0 && fillPlan) {
                    testCart.push({
                        plan: fillPlan,
                        quantity: linesRemaining,
                        cbbMixEnabled: false,
                        cbbMixCount: 0
                    });
                }

                // === TRIN 3: Overvej bredbånd fra samme provider ===
                // Hvis vi har valgt en mobilplan, overvej også bredbånd fra samme provider
                const mainProvider = mainPlan.provider;
                if (mainProvider && broadbandPlans.length > 0) {
                    const matchingBroadband = broadbandPlans.find(bb => {
                        // Match Telmore mobil med Telmore bredbånd, Telenor mobil med Telenor bredbånd
                        if (mainProvider === 'telmore' && bb.id.includes('telmore')) return true;
                        if (mainProvider === 'telenor' && bb.id.includes('telenor')) return true;
                        return false;
                    });

                    if (matchingBroadband) {
                        // Tjek om bredbånd giver økonomisk mening
                        const broadbandMonthlyCost = validCustomerMobileCost * 0.3; // Estimer bredbånd udgør ~30% af mobiludgifter
                        const broadbandSavings = broadbandMonthlyCost * 6; // 6 måneder

                        // Kun tilføj hvis det giver besparelse eller hvis kunden allerede har bredbånd
                        if (broadbandSavings > (matchingBroadband.price * 6) || validCustomerMobileCost > 200) {
                            testCart.push({
                                plan: matchingBroadband,
                                quantity: 1,
                                cbbMixEnabled: false,
                                cbbMixCount: 0
                            });
                        }
                    }
                }

                // === BEREGN ØKONOMI & SCORE ===
                
                // 1. Dækning
                const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
                const notIncludedCount = coverage.notIncluded.length;
                
                // Estimeret streaming cost for manglende tjenester (standard 100kr/stk)
                const extraStreamingCost = notIncludedCount * 100;

                // 2. Totaler
                const ourTotal = calculateOurOfferTotal(testCart, extraStreamingCost, 0, validOriginalItemPrice);
                if (!ourTotal || typeof ourTotal !== 'object') continue;
                
                const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) ? ourTotal.sixMonth : 0;
                const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
                const earnings = calculateTotalEarnings(testCart);

                if (earnings <= 0) continue;

                // 3. Score Beregning
                let score = 0;
                score += earnings * EARNINGS_WEIGHT;

                if (savings >= 0) {
                    score += savings * SAVINGS_WEIGHT;
                } else {
                    score += savings * UPSELL_PENALTY_FACTOR;
                    if (savings < -500 && earnings < 2000) score -= 10000;
                }

                // Bonus for komplet dækning - dette sikrer at "4 tjenester pakken" vinder over "2 tjenester pakken"
                if (notIncludedCount === 0) score += FULL_COVERAGE_BONUS;

                if (score > bestScore) {
                    bestScore = score;
                    bestSolution = testCart;
                    bestSavings = savings;
                    bestEarnings = earnings;
                    
                    const mainName = mainPlan.name;
                    const fillName = (linesRemaining > 0 && fillPlan) ? fillPlan.name : '';
                    const mixInfo = (tempCartStart.length > 0 && tempCartStart[0].cbbMixEnabled) ? ` (Mix ${tempCartStart[0].cbbMixCount})` : '';

                    // Tjek om bredbånd er inkluderet
                    const broadbandIncluded = testCart.some(item => item.plan.type === 'broadband');
                    const broadbandName = broadbandIncluded ? testCart.find(item => item.plan.type === 'broadband').plan.name : '';

                    bestExplanation = `Anbefaling: ${mainName}${mixInfo}`;
                    if (linesRemaining > 0 && fillName && fillName !== mainName) {
                        bestExplanation += ` + ${linesRemaining} stk ${fillName}`;
                    }
                    if (broadbandIncluded) {
                        bestExplanation += ` + ${broadbandName}`;
                    }
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
