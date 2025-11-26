/**
 * Optimizer Logic
 * 
 * Contains the core algorithm for finding the best subscription solution.
 */

import logger from '../logger.js';
import { getServiceById } from '../../data/streamingServices.js';
import { OPTIMIZER } from '../../constants/businessRules.js';
import {
    calculateCustomerTotal,
    calculateOurOfferTotal,
    calculateSavings,
    calculateTotalEarnings,
    formatCurrency
} from './pricing.js';
import { checkStreamingCoverageWithCBBMix } from './streaming.js';

/**
 * Tjek om alle planer i en kurv kommer fra samme operatør
 * @param {Array} cartItems - Array af kurv-items
 * @returns {boolean} True hvis alle planer har samme provider, ellers false
 */
function hasSameProvider(cartItems) {
    if (!cartItems || cartItems.length === 0) return true;
    if (cartItems.length === 1) return true;

    const firstProvider = cartItems[0].plan.provider;
    return cartItems.every(item => item.plan.provider === firstProvider);
}

/**
 * Find den bedste automatiske løsning for kunden
 * OPTIMERET: Aggressivt salg, men med "Smart Bundling" (undgår unødvendige streaming-pakker)
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
    // Valider availablePlans
    if (!Array.isArray(availablePlans) || availablePlans.length === 0) {
        return {
            cartItems: [],
            explanation: 'Ingen tilgængelige planer fundet',
            savings: 0,
            earnings: 0
        };
    }

    // Valider selectedStreaming
    if (!Array.isArray(selectedStreaming)) {
        selectedStreaming = [];
    }

    // Valider getStreamingPrice - skal være funktion eller null
    if (getStreamingPrice !== null && typeof getStreamingPrice !== 'function') {
        getStreamingPrice = null;
    }

    // Valider options
    if (!options || typeof options !== 'object') {
        options = {};
    }

    // Valider og normaliser options værdier
    const numberOfLines = Number.isInteger(options.requiredLines) && options.requiredLines > 0
        ? options.requiredLines
        : 1;

    const {
        preferSavings = true, // Prioriter besparelse over indtjening
        minSavings = -Infinity, // Minimum besparelse krævet
        maxLines = OPTIMIZER.DEFAULT_MAX_LINES, // Maks antal linjer totalt
        requiredLines = numberOfLines, // Påkrævet antal linjer
        excludedProviders = [] // Array af provider navne der skal ekskluderes (fx ['telmore', 'telenor', 'cbb'])
    } = options;

    // Valider at requiredLines er et gyldigt tal
    const validRequiredLines = Number.isInteger(requiredLines) && requiredLines > 0 && requiredLines <= 20
        ? requiredLines
        : 1;

    // Valider at excludedProviders er et array
    const validExcludedProviders = Array.isArray(excludedProviders) ? excludedProviders : [];

    // Valider numeriske input
    const validCustomerMobileCost = Number.isFinite(customerMobileCost) && customerMobileCost >= 0
        ? customerMobileCost
        : 0;

    const validOriginalItemPrice = Number.isFinite(originalItemPrice) && originalItemPrice >= 0
        ? originalItemPrice
        : 0;

    // Filtrer planer - ekskluder business planer og bredbånd hvis ikke relevant
    let today = new Date();
    if (!Number.isFinite(today.getTime())) {
        // Hvis dato er ugyldig, brug nuværende dato
        today = new Date();
    }
    today.setHours(0, 0, 0, 0);

    const mobilePlans = availablePlans.filter(plan => {
        // Defensive check: Plan skal være et objekt
        if (!plan || typeof plan !== 'object') return false;

        // Defensive checks for plan properties
        if (plan.business === true) return false;
        if (plan.type === 'broadband') return false;

        // KRITISK: Ekskluder planer med negativ eller nul indtjening
        // Vi skal kun vælge løsninger hvor vi tjener penge
        const earnings = (plan.earnings != null && Number.isFinite(plan.earnings)) ? plan.earnings : 0;
        if (earnings <= 0) return false;

        // Ekskluder planer fra eksisterende brands
        if (validExcludedProviders && validExcludedProviders.length > 0) {
            const planProvider = (plan.provider && typeof plan.provider === 'string') ? plan.provider : '';
            const isExcluded = validExcludedProviders.some(excluded => {
                if (!excluded || typeof excluded !== 'string') return false;
                // Match både eksakt og med variante navne (fx 'telenor' matcher 'telenor-bredbånd')
                return planProvider.toLowerCase() === excluded.toLowerCase() ||
                    planProvider.toLowerCase().startsWith(excluded.toLowerCase() + '-');
            });
            if (isExcluded) {
                return false;
            }
        }

        // Tjek expiresAt - defensive date handling
        if (plan.expiresAt != null && !plan.campaignExpiresAt) {
            try {
                const expiresAtDate = new Date(plan.expiresAt);
                if (Number.isFinite(expiresAtDate.getTime())) {
                    expiresAtDate.setHours(23, 59, 59, 999);
                    if (today > expiresAtDate) return false;
                }
            } catch (e) {
                // Hvis dato er ugyldig, ekskluder planen for sikkerheds skyld
                return false;
            }
        }

        // Tjek availableFrom - defensive date handling
        if (plan.availableFrom != null) {
            try {
                const availableFromDate = new Date(plan.availableFrom);
                if (Number.isFinite(availableFromDate.getTime())) {
                    availableFromDate.setHours(0, 0, 0, 0);
                    if (today < availableFromDate) return false;
                }
            } catch (e) {
                // Hvis dato er ugyldig, ekskluder planen for sikkerheds skyld
                return false;
            }
        }

        return true;
    });

    if (mobilePlans.length === 0) {
        return {
            cartItems: [],
            explanation: 'Ingen tilgængelige planer fundet',
            savings: 0,
            earnings: 0
        };
    }

    // Beregn streaming-pris hvis funktion er givet
    const getPrice = getStreamingPrice || ((id) => 100); // Fallback til 100 kr

    // Sikre array operation - valider selectedStreaming før reduce
    let streamingCost = 0;
    if (Array.isArray(selectedStreaming) && selectedStreaming.length > 0) {
        try {
            streamingCost = selectedStreaming.reduce((sum, id) => {
                if (id == null) return sum;
                const price = getPrice(id);
                const validPrice = Number.isFinite(price) && price >= 0 ? price : 0;
                const newSum = sum + validPrice;
                // Valider at sum ikke bliver ugyldig
                return Number.isFinite(newSum) ? newSum : sum;
            }, 0);
            // Sikre at streamingCost er et gyldigt tal
            if (!Number.isFinite(streamingCost) || streamingCost < 0) {
                streamingCost = 0;
            }
        } catch (e) {
            // Hvis reduce fejler, brug 0
            streamingCost = 0;
        }
    }

    // Kundens mobiludgifter er allerede totalt (ikke pr. linje)
    const customerTotal = calculateCustomerTotal(validCustomerMobileCost, streamingCost, validOriginalItemPrice);

    // Valider customerTotal resultat
    if (!customerTotal || typeof customerTotal !== 'object') {
        return {
            cartItems: [],
            explanation: 'Fejl ved beregning af kundens total',
            savings: 0,
            earnings: 0
        };
    }

    // Valider at customerTotal har gyldige tal
    const validCustomerSixMonth = Number.isFinite(customerTotal.sixMonth) && customerTotal.sixMonth >= 0
        ? customerTotal.sixMonth
        : 0;

    // === SMART AGGRESSIV LOGIK ===

    // 1. Find "Efficiency Baseline": Hvad er det mindste antal streaming-linjer vi KAN nøjes med?
    // Vi finder den plan, der dækker flest tjenester, for at se hvad "idealet" er.
    let maxStreamingSlotsInAnyPlan = 0;
    mobilePlans.forEach(plan => {
        let slots = 0;
        if (plan.cbbMixAvailable) slots = 8; // CBB Mix kan tage mange
        else if (plan.streamingCount) slots = plan.streamingCount;
        else if (plan.streaming?.length) slots = plan.streaming.length;

        if (slots > maxStreamingSlotsInAnyPlan) maxStreamingSlotsInAnyPlan = slots;
    });

    // Mindste antal linjer nødvendigt for at dække behovet (Idealet)
    const minStreamingLinesNeeded = maxStreamingSlotsInAnyPlan > 0
        ? Math.ceil(selectedStreaming.length / maxStreamingSlotsInAnyPlan)
        : 0;

    let bestSolution = null;
    let bestScore = -Infinity;
    let bestSavings = 0;
    let bestEarnings = 0;
    let bestExplanation = "";

    // Dynamisk smertegrænse for mersalg
    const getMaxAdditionalCost = (earnings) => {
        if (earnings > OPTIMIZER.EARNINGS_HIGH_THRESHOLD) return OPTIMIZER.MAX_ADDITIONAL_COST_HIGH;
        if (earnings > OPTIMIZER.EARNINGS_MEDIUM_THRESHOLD) return OPTIMIZER.MAX_ADDITIONAL_COST_MEDIUM;
        return OPTIMIZER.MAX_ADDITIONAL_COST_LOW;
    };

    // Find voice-only planer til opfyldning (sorteret efter indtjening)
    const voiceOnlyPlans = mobilePlans.filter(p => !p.streamingCount && !p.cbbMixAvailable && (!p.streaming || p.streaming.length === 0))
        .sort((a, b) => {
            try {
                const earningsA = (a.earnings != null && Number.isFinite(a.earnings)) ? a.earnings : 0;
                const earningsB = (b.earnings != null && Number.isFinite(b.earnings)) ? b.earnings : 0;
                return earningsB - earningsA;
            } catch (e) {
                return 0;
            }
        });

    // Kør igennem alle planer som potentiel "Hoved-plan"
    for (const mainPlan of mobilePlans) {
        try {
            const testCart = [];

            let streamingLinesUsed = 0;

            logger.debug('CBB_MIX', `--- Evaluerer plan: ${mainPlan.name} (${mainPlan.provider}) ---`);
            logger.debug('CBB_MIX', `cbbMixAvailable: ${mainPlan.cbbMixAvailable}, streamingCount: ${mainPlan.streamingCount}`);

            // LOGIK: Hvor mange hoved-planer skal vi bruge?
            // Hvis kunden har streaming-behov, dækker vi det først.
            if (selectedStreaming.length > 0) {
                let slotsPerLine = 0;
                if (mainPlan.cbbMixAvailable) slotsPerLine = 8; // Teoretisk max
                else if (mainPlan.streamingCount) slotsPerLine = mainPlan.streamingCount;
                else if (mainPlan.streaming?.length) slotsPerLine = mainPlan.streaming.length; // Faste tjenester

                logger.debug('CBB_MIX', `slotsPerLine: ${slotsPerLine}, selectedStreaming: ${selectedStreaming.length}`);

                if (slotsPerLine > 0) {
                    // Beregn antal nødvendige linjer med denne plan
                    const needed = Math.ceil(selectedStreaming.length / slotsPerLine);
                    streamingLinesUsed = Math.min(needed, validRequiredLines); // Kan ikke bruge flere end kunden skal have

                    logger.debug('CBB_MIX', `needed: ${needed}, streamingLinesUsed: ${streamingLinesUsed}, validRequiredLines: ${validRequiredLines}`);

                    // CBB MIX REGEL: Kun én linje kan have CBB Mix aktiveret
                    // Hvis det er en CBB Mix plan, skal vi oprette:
                    // 1. Én linje MED Mix (til streaming)
                    // 2. Resterende linjer UDEN Mix (bare mobil)
                    if (mainPlan.cbbMixAvailable) {
                        // Første linje: Med CBB Mix
                        const cbbMixCount = Math.min(selectedStreaming.length, 6); // Max 6 tjenester i Mix

                        logger.debug('CBB_MIX', `🎯 CBB MIX AKTIVERET - Tilføjer 1 linje MED Mix (cbbMixCount: ${cbbMixCount})`);

                        testCart.push({
                            plan: mainPlan,
                            quantity: 1,
                            cbbMixEnabled: true,
                            cbbMixCount
                        });

                        // Resterende streaming-linjer: Uden CBB Mix (bare mobil)
                        if (streamingLinesUsed > 1) {
                            logger.debug('CBB_MIX', `📱 Tilføjer ${streamingLinesUsed - 1} linje(r) UDEN Mix (bare mobil)`);

                            testCart.push({
                                plan: mainPlan,
                                quantity: streamingLinesUsed - 1,
                                cbbMixEnabled: false,
                                cbbMixCount: 0
                            });
                        }
                    } else {
                        // Ikke-CBB plan (Telmore/Telenor med streamingCount)
                        logger.debug('CBB_MIX', `Ikke-CBB plan - tilføjer ${streamingLinesUsed} linje(r)`);

                        testCart.push({
                            plan: mainPlan,
                            quantity: streamingLinesUsed,
                            cbbMixEnabled: false,
                            cbbMixCount: 0
                        });
                    }
                } else {
                    // Voice-only plan som "Main" (hvis ingen streaming valgt eller fallback)
                    streamingLinesUsed = 0;
                    logger.debug('CBB_MIX', `Voice-only plan (slotsPerLine=0), venter til fill-up`);
                    // Vi tilføjer den ikke her, venter til fill-up
                }
            }

            // Fill-up: Fyld resten af linjerne op
            const linesCovered = testCart.reduce((sum, item) => sum + item.quantity, 0);
            const linesRemaining = validRequiredLines - linesCovered;

            logger.debug('CBB_MIX', `Fill-up: linesCovered=${linesCovered}, linesRemaining=${linesRemaining}`);

            if (linesRemaining > 0) {
                // Hvis vi allerede har brugt en plan, prøv at finde voice-only fra SAMME udbyder
                const provider = mainPlan.provider;
                let fillPlan;

                if (preferSavings && !mainPlan.streamingCount && !mainPlan.cbbMixAvailable && (!mainPlan.streaming || mainPlan.streaming.length === 0)) {
                    // Hvis vi foretrækker besparelse og mainPlan er voice-only, så brug den!
                    // Dette sikrer at vi faktisk tester den billige plan og ikke bare opgraderer til den dyreste.
                    fillPlan = mainPlan;
                } else {
                    // Standard / Fallback: Find den bedste indtjening fra samme udbyder
                    fillPlan = voiceOnlyPlans.find(p => p.provider === provider);
                }

                // Hvis ingen voice-only fra samme udbyder, brug mainPlan igen (hvis det er voice-only) eller den bedste voice-only på tværs
                if (!fillPlan) {
                    if (!mainPlan.streamingCount) fillPlan = mainPlan;
                    else fillPlan = voiceOnlyPlans[0]; // Fallback til bedste indtjening uanset udbyder (hvis tilladt)
                }

                if (fillPlan) {
                    logger.debug('CBB_MIX', `📱 Fill-up: Tilføjer ${linesRemaining} linje(r) med ${fillPlan.name} (cbbMixEnabled: false)`);

                    testCart.push({
                        plan: fillPlan,
                        quantity: linesRemaining,
                        cbbMixEnabled: false,
                        cbbMixCount: 0
                    });
                }
            }

            // Spring over hvis vi ikke fik fyldt op (burde ikke ske)
            const totalLines = testCart.reduce((sum, item) => sum + item.quantity, 0);
            if (totalLines < validRequiredLines) continue;

            // LOG FINAL CART FOR DENNE PLAN
            logger.debug('CBB_MIX', `📦 testCart for ${mainPlan.name}:`, testCart.map(item => ({
                plan: item.plan.name,
                quantity: item.quantity,
                cbbMixEnabled: item.cbbMixEnabled,
                cbbMixCount: item.cbbMixCount
            })));

            // Beregn økonomi
            // (Brug din eksisterende logik til coverage check her for nøjagtighed)
            const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
            const notIncludedCount = coverage.notIncluded.length;
            // Estimeret streaming cost for manglende tjenester (standard 100kr/stk)
            const extraStreamingCost = notIncludedCount * 100;

            const ourTotal = calculateOurOfferTotal(testCart, extraStreamingCost, 0, validOriginalItemPrice);

            // Valider ourTotal
            if (!ourTotal || typeof ourTotal !== 'object') continue;
            const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
                ? ourTotal.sixMonth
                : 0;

            const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
            const earnings = calculateTotalEarnings(testCart);

            // Valider earnings
            const validEarnings = Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
            const validSavings = Number.isFinite(savings) ? savings : -Infinity;

            // === SCORE BEREGNING (Den vigtige del) ===

            // Regel 1: Indtjening skal være positiv
            if (validEarnings <= 0) continue;

            // Regel 2: Kunden må ikke flås (maks mersalg)
            const maxAdd = getMaxAdditionalCost(validEarnings);
            if (validSavings < -maxAdd) continue;

            // Regel 3: SMART Score
            // Vi straffer "Ineffektivitet". Hver unødvendig streaming-linje koster "point"
            // Hvis vi bruger 4 linjer til at dække noget der kunne klares med 1, straffer vi det.
            // Straf = 1000 kr i 'virtuel' indtjening pr. unødvendig linje.

            let inefficiencyPenalty = 0;
            if (selectedStreaming.length > 0 && streamingLinesUsed > minStreamingLinesNeeded) {
                const extraLines = streamingLinesUsed - minStreamingLinesNeeded;
                inefficiencyPenalty = extraLines * OPTIMIZER.INEFFICIENCY_PENALTY; // Hård straf for at være dum
            }

            // Straf for "wasted slots" (ubrugte pladser i de valgte linjer)
            // Dette sikrer at vi vælger den plan der passer bedst (f.eks. 2 slots til 2 tjenester frem for 3 slots)
            if (selectedStreaming.length > 0 && streamingLinesUsed > 0) {
                let slotsPerLine = 0;
                if (mainPlan.cbbMixAvailable) slotsPerLine = 8;
                else if (mainPlan.streamingCount) slotsPerLine = mainPlan.streamingCount;
                else if (mainPlan.streaming?.length) slotsPerLine = mainPlan.streaming.length;

                const totalSlotsAvailable = streamingLinesUsed * slotsPerLine;
                const wastedSlots = Math.max(0, totalSlotsAvailable - selectedStreaming.length);

                // Tilføj straf for wasted slots
                inefficiencyPenalty += wastedSlots * OPTIMIZER.WASTED_SLOT_PENALTY;
            }

            // Score = Indtjening - Straf
            // Vi ignorerer savings i scoren (kun som hard limit ovenfor), så vi fokuserer på indtjening.
            let score;

            if (preferSavings) {
                // Hybrid: Prioriter at kunden sparer penge (eller går i nul), men maksimer indtjening inden for den ramme.
                if (validSavings >= 0) {
                    // Hvis kunden sparer penge (eller 0):
                    // Giv kæmpe bonus så disse altid vinder over mersalg.
                    // Sorter derefter efter indtjening.
                    score = validEarnings + OPTIMIZER.SAVINGS_PRIORITY_BONUS - inefficiencyPenalty;
                } else {
                    // Hvis kunden skal betale mere (mersalg):
                    // Kun indtjening tæller (men de taber til spare-løsninger)
                    score = validEarnings - inefficiencyPenalty;
                }
            } else {
                // Standard (Sælger fokus): Score = Indtjening - Straf
                score = validEarnings - inefficiencyPenalty;
            }

            // Bonus for at dække ALT streaming (for kundetilfredshed)
            if (notIncludedCount === 0) score += OPTIMIZER.FULL_COVERAGE_BONUS;

            if (score > bestScore) {
                bestScore = score;
                bestSolution = testCart;
                bestSavings = validSavings;
                bestEarnings = validEarnings;

                // Lav forklaring
                const mainName = mainPlan.name || 'Ukendt plan';
                const savingsText = validSavings >= 0 ? `Besparelse: ${formatCurrency(validSavings)}` : `Mersalg: ${formatCurrency(Math.abs(validSavings))}`;
                bestExplanation = `Anbefaling: ${mainName} løsning (${streamingLinesUsed} x Stream, ${linesRemaining} x Tale) - Indtjening: ${formatCurrency(validEarnings)}`;
            }

        } catch (e) {
            continue;
        }
    }

    // Hvis ingen løsning fundet, returner tom array
    if (!bestSolution || bestEarnings <= 0) {
        return {
            cartItems: [],
            explanation: 'Kunne ikke finde en løsning med positiv indtjening inden for mersalgs-grænsen',
            savings: 0,
            earnings: 0
        };
    }

    // ===== VALIDER RESULTAT FØR RETURNERING =====
    // Final check: Sikre at løsningen har positiv indtjening før vi returnerer den
    const finalBestEarnings = Number.isFinite(bestEarnings) ? bestEarnings : 0;
    if (bestSolution && finalBestEarnings <= 0) {
        return {
            cartItems: [],
            explanation: 'Ingen løsning med positiv indtjening fundet',
            savings: 0,
            earnings: 0
        };
    }

    // Final check: Sikre at alle planer i løsningen kommer fra samme operatør
    if (bestSolution && !hasSameProvider(bestSolution)) {
        return {
            cartItems: [],
            explanation: 'Ingen løsning med samme operatør fundet',
            savings: 0,
            earnings: 0
        };
    }

    // Valider at cartItems er et array og har gyldige items
    let validCartItems = [];
    if (Array.isArray(bestSolution)) {
        validCartItems = bestSolution.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (!item.plan || typeof item.plan !== 'object') return false;
            if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;
            return true;
        });
    }

    // LOG FINAL LØSNING
    logger.info('CBB_MIX', '🏆 ===== ENDELIG LØSNING =====');
    logger.info('CBB_MIX', `Antal items i kurv: ${validCartItems.length}`);
    validCartItems.forEach((item, index) => {
        logger.info('CBB_MIX', `  [${index}] ${item.plan.name} x${item.quantity} | cbbMixEnabled: ${item.cbbMixEnabled} | cbbMixCount: ${item.cbbMixCount}`);
    });

    // Tæl antal linjer med CBB Mix
    const linesWithMix = validCartItems.filter(item => item.cbbMixEnabled === true).reduce((sum, item) => sum + item.quantity, 0);
    logger.info('CBB_MIX', `📊 Antal linjer med CBB Mix aktiveret: ${linesWithMix}`);
    if (linesWithMix > 1) {
        logger.warn('CBB_MIX', `⚠️ FEJL: Mere end 1 linje har CBB Mix aktiveret! (${linesWithMix} linjer)`);
    }

    // Valider at savings og earnings er gyldige tal
    const finalSavings = Number.isFinite(bestSavings) ? bestSavings : 0;
    const finalEarnings = Number.isFinite(bestEarnings) ? bestEarnings : 0;
    const finalExplanation = (bestExplanation && typeof bestExplanation === 'string')
        ? bestExplanation
        : 'Ingen løsning fundet';

    return {
        cartItems: validCartItems,
        explanation: finalExplanation,
        savings: finalSavings,
        earnings: finalEarnings
    };
}
