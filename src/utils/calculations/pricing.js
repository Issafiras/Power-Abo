/**
 * Pricing Calculations
 * 
 * Handles core price calculations for plans, discounts, and earnings.
 */

import { CAMPAIGN, PRICING, OPTIMIZER } from '../../constants/businessRules.js';

/**
 * Tjek om kampagnen er aktiv for en plan
 * @param {Object} plan - Plan objekt med campaignExpiresAt (valgfri)
 * @returns {boolean} True hvis kampagnen er aktiv
 */
export function isCampaignActive(plan) {
    if (!plan || !plan.campaignExpiresAt) return false;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiresAtDate = new Date(plan.campaignExpiresAt);
        expiresAtDate.setHours(23, 59, 59, 999);
        return today <= expiresAtDate;
    } catch (e) {
        return false;
    }
}

/**
 * Hent den aktuelle pris for en plan (kampagnepris hvis aktiv, ellers original eller normal pris)
 * @param {Object} plan - Plan objekt
 * @returns {number} Aktuel pris
 */
export function getCurrentPrice(plan) {
    if (!plan) return 0;

    // Hvis kampagnen er aktiv, brug kampagneprisen
    if (isCampaignActive(plan) && plan.campaignPrice != null) {
        return plan.campaignPrice;
    }

    // Hvis der er original pris (efter kampagnens udløb), brug den
    if (plan.originalPrice != null) {
        return plan.originalPrice;
    }

    // Ellers brug normal pris
    return plan.price || 0;
}

/**
 * Beregn 6-måneders pris for en plan med intro-pris håndtering
 * @param {Object} plan - Plan objekt med price, introPrice (valgfri), introMonths (valgfri)
 * @param {number} quantity - Antal linjer/abonnementer
 * @returns {number} Total 6-måneders pris for alle linjer
 */
export function calculateSixMonthPrice(plan, quantity = 1) {
    if (!plan) return 0;

    // Hent den aktuelle pris (kampagnepris hvis aktiv, ellers original/normal pris)
    const currentPrice = getCurrentPrice(plan);

    // Hvis der er intro-pris (fx 199 kr i 3 måneder, derefter 299 kr)
    if (plan.introPrice && plan.introMonths) {
        // Step 1: Beregn intro-pris for intro-perioden
        const introTotal = plan.introPrice * plan.introMonths * quantity;

        // Step 2: Beregn normal pris for resterende måneder (brug aktuel pris)
        const remainingMonths = 6 - plan.introMonths;
        const normalTotal = currentPrice * remainingMonths * quantity;

        // Step 3: Total = intro + normal
        return introTotal + normalTotal;
    }

    // Normal pris (ingen intro-pris): aktuel pris × 6 måneder × antal linjer
    return currentPrice * 6 * quantity;
}

/**
 * Beregn månedlig pris for en plan (gennemsnit over 6 måneder hvis intro-pris)
 * @param {Object} plan - Plan objekt
 * @param {number} quantity - Antal linjer
 * @returns {number} Gennemsnitlig månedlig pris
 */
export function calculateMonthlyPrice(plan, quantity = 1) {
    if (!plan) return 0;

    // Hvis intro-pris: beregn gennemsnit over 6 måneder
    if (plan.introPrice && plan.introMonths) {
        const sixMonthTotal = calculateSixMonthPrice(plan, quantity);
        return sixMonthTotal / 6; // Gennemsnitlig månedlig pris
    }

    // Normal pris: brug aktuel pris (kampagnepris hvis aktiv) × antal linjer
    const currentPrice = getCurrentPrice(plan);
    return currentPrice * quantity;
}

/**
 * Beregn CBB MIX pris for en plan
 * @param {Object} plan - Plan objekt
 * @param {number} mixCount - Antal CBB MIX tjenester (2-8)
 * @returns {number} CBB MIX pris
 */
export function calculateCBBMixPrice(plan, mixCount) {
    if (!plan.cbbMixAvailable || !mixCount) return 0;
    return plan.cbbMixPricing[mixCount] || 0;
}

/**
 * Beregn plan med CBB MIX
 * @param {Object} plan - Plan objekt
 * @param {number} quantity - Antal linjer
 * @param {number} mixCount - Antal CBB MIX tjenester
 * @returns {number} Total 6-måneders pris inkl. CBB MIX
 */
export function calculatePlanWithCBBMix(plan, quantity = 1, mixCount = 0) {
    const basePrice = calculateSixMonthPrice(plan, quantity);
    const mixPrice = calculateCBBMixPrice(plan, mixCount) * 6; // 6 måneder
    return basePrice + mixPrice;
}

/**
 * Beregn Telenor familie-rabat
 * @param {Array} cartItems - Array af kurv-items
 * @returns {number} Total månedlig rabat i kr
 */
export function calculateTelenorFamilyDiscount(cartItems) {
    if (!cartItems || cartItems.length === 0) return 0;

    // Step 1: Tæl antal Telenor-linjer med familyDiscount
    const telenorLines = cartItems
        .filter(item => item.plan.provider === 'telenor' && item.plan.familyDiscount)
        .reduce((total, item) => total + item.quantity, 0);

    // Step 2: Beregn rabat = (antal_linjer - 1) × 50 kr/md
    if (telenorLines <= 1) return 0;
    return (telenorLines - 1) * PRICING.TELENOR_FAMILY_DISCOUNT;
}

/**
 * Beregn total indtjening fra kurv
 * @param {Array} cartItems - Array af kurv-items
 * @returns {number} Total indtjening
 */
export function calculateTotalEarnings(cartItems) {
    if (!cartItems || cartItems.length === 0) return 0;

    // Tjek om vi stadig er inden for kampagneperioden
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const campaignEndDate = new Date(CAMPAIGN.END_DATE);
    campaignEndDate.setHours(23, 59, 59, 999);
    const isWithinCampaignPeriod = today <= campaignEndDate;

    return cartItems.reduce((total, item) => {
        // Telenor 170 kr plan har forskellig indtjening for første vs. efterfølgende abonnementer
        if (item.plan.id === 'telenor-170kr' && item.plan.earningsAdditional) {
            // Første abonnement: 900 kr, resten: 1100 kr hver
            const firstEarnings = item.plan.earnings || 0;
            const additionalEarnings = item.plan.earningsAdditional || 0;
            const additionalQuantity = Math.max(0, item.quantity - 1);
            return total + firstEarnings + (additionalEarnings * additionalQuantity);
        }

        // Standard beregning for alle andre planer
        let earnings = (item.plan.earnings || 0) * item.quantity;

        // Alle CBB planer giver 100 kr ekstra indtjening pr. linje
        if (item.plan.provider === 'cbb') {
            earnings += PRICING.CBB_BASE_EARNINGS * item.quantity;

            // CBB planer med pris >= 129 kr får ekstra 200 kr indtjening pr. linje indtil kampagneudløb
            if (isWithinCampaignPeriod && item.plan.price >= CAMPAIGN.CBB_EXTRA_EARNINGS_THRESHOLD) {
                earnings += CAMPAIGN.CBB_EXTRA_EARNINGS_AMOUNT * item.quantity;
            }

            // CBB MIX giver 100 kr ekstra indtjening pr. linje hvis aktiveret
            if (item.cbbMixEnabled && item.cbbMixCount > 0) {
                earnings += PRICING.CBB_MIX_EARNINGS * item.quantity;
            }
        }

        return total + earnings;
    }, 0);
}

/**
 * Beregn kunde totaler (hvad kunden betaler nu)
 * @param {number} currentMobileCost - Nuværende mobiludgifter pr. måned (TOTAL for alle linjer)
 * @param {number} streamingCost - Total streaming-udgifter pr. måned
 * @param {number} originalItemPrice - Varens pris inden rabat (engangspris, valgfri)
 * @returns {Object} { monthly: number, sixMonth: number }
 */
export function calculateCustomerTotal(currentMobileCost, streamingCost, originalItemPrice = 0) {
    // Step 1: Månedlig total = mobil + streaming
    const monthly = (currentMobileCost || 0) + (streamingCost || 0);

    // Step 2: 6-måneders total = (månedlig × 6) + varens pris (engangsbetaling)
    return {
        monthly,
        sixMonth: (monthly * 6) + (originalItemPrice || 0)
    };
}

/**
 * Beregn vores tilbud total (hvad kunden betaler med os)
 * @param {Array} cartItems - Array af kurv-items
 * @param {number} streamingCost - Ikke-inkluderet streaming-omkostning pr. måned
 * @param {number} cashDiscount - Kontant rabat (engangsrabat, valgfri)
 * @param {number} originalItemPrice - Varens pris inden rabat (engangspris, valgfri)
 * @returns {Object} { monthly: number, sixMonth: number, telenorDiscount: number }
 */
export function calculateOurOfferTotal(cartItems, streamingCost = 0, cashDiscount = 0, originalItemPrice = 0) {
    if (!cartItems || cartItems.length === 0) {
        return { monthly: 0, sixMonth: 0, telenorDiscount: 0 };
    }

    // ===== TRIN 1: ABONNEMENT PRISER =====

    // Beregn 6-måneders total for alle planer (inkl. CBB Mix)
    const plansSixMonth = cartItems.reduce((total, item) => {
        // Basis pris for planen (inkl. intro-priser)
        let itemTotal = calculateSixMonthPrice(item.plan, item.quantity);

        // Tilføj CBB Mix pris hvis aktiv (månedlig pris × 6 måneder × antal linjer)
        if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount) {
            const mixPrice = calculateCBBMixPrice(item.plan, item.cbbMixCount);
            itemTotal += mixPrice * 6 * item.quantity; // 6 måneder
        }

        return total + itemTotal;
    }, 0);

    // ===== TRIN 2: FAMILIE RABAT =====
    // Beregn Telenor familie-rabat (månedlig)
    const telenorDiscount = calculateTelenorFamilyDiscount(cartItems);
    const telenorDiscountSixMonth = telenorDiscount * 6; // Konverter til 6 måneder

    // Total efter familie-rabat
    const afterFamilyDiscount = plansSixMonth - telenorDiscountSixMonth;

    // ===== TRIN 3: STREAMING TILLÆG =====
    // Tilføj ikke-inkluderet streaming (månedlig × 6)
    const streamingSixMonth = streamingCost * 6;

    // ===== TRIN 4: KONTANT RABAT =====
    // Total før kontant rabat
    const beforeCashDiscount = afterFamilyDiscount + streamingSixMonth;

    // Træk kontant rabat fra (engangsrabat, kun hvis aktiv)
    const afterCashDiscount = beforeCashDiscount - (cashDiscount || 0);

    // ===== TRIN 5: ENGANGSBETALINGER =====
    // Tilføj varens pris (engangsbetaling)
    const sixMonth = afterCashDiscount + (originalItemPrice || 0);

    return {
        monthly: afterCashDiscount / 6, // Månedlig beregnes uden engangsbetalinger (abonnementer + streaming - rabatter)
        sixMonth: Math.max(0, sixMonth), // Må ikke være negativ
        telenorDiscount // Månedlig Telenor rabat (til visning)
    };
}

/**
 * Beregn besparelse (forskellen mellem kundens nuværende situation og vores tilbud)
 * @param {number} customerTotal - Kunde 6-måneders total (hvad de betaler nu)
 * @param {number} ourTotal - Vores 6-måneders total (hvad de betaler med os)
 * @returns {number} Besparelse i kr (positiv = besparelse, negativ = mersalg)
 */
export function calculateSavings(customerTotal, ourTotal) {
    return customerTotal - ourTotal;
}

/**
 * Auto-justér kontant rabat for minimum besparelse
 * @param {number} customerTotal - Kunde 6-måneders total
 * @param {number} ourTotalBeforeDiscount - Vores total før kontant rabat
 * @param {number} minimumSavings - Minimum ønsket besparelse (standard: 500)
 * @param {number} totalEarnings - Total engangsindtjening fra løsningen (ikke løbende)
 * @returns {number} Nødvendig kontant rabat
 */
export function autoAdjustCashDiscount(customerTotal, ourTotalBeforeDiscount, minimumSavings = OPTIMIZER.DEFAULT_MIN_SAVINGS, totalEarnings = 0) {
    const currentSavings = customerTotal - ourTotalBeforeDiscount;

    // Hvis kunden allerede har god besparelse, ingen rabat nødvendig
    if (currentSavings >= minimumSavings) {
        return 0;
    }

    // Beregn hvor meget kunden betaler ekstra (negativ besparelse = mersalg)
    const additionalCost = Math.max(0, -currentSavings);

    // Sælger-strategi: Hvis kunden betaler for meget mere, giv noget af indtjeningen tilbage
    const maxDiscountFromEarnings = Math.floor(totalEarnings * OPTIMIZER.MAX_DISCOUNT_FROM_EARNINGS_PERCENT);

    // Beregn nødvendig rabat for at nå minimum besparelse
    const neededDiscountForSavings = minimumSavings - currentSavings;

    // Hvis kunden betaler mere end threshold, giv noget af indtjeningen tilbage
    let suggestedDiscount = 0;

    if (additionalCost > OPTIMIZER.COST_THRESHOLD_FOR_DISCOUNT) {
        // Giv op til 50% af den ekstra omkostning tilbage, men maksimalt 60% af indtjening
        const discountFromCost = Math.floor(additionalCost * OPTIMIZER.MAX_DISCOUNT_FROM_COST_PERCENT);
        suggestedDiscount = Math.min(discountFromCost, maxDiscountFromEarnings);
    }

    // Kombiner: Tag den højeste af de to
    const finalDiscount = Math.max(neededDiscountForSavings, suggestedDiscount);

    // Rund op til nærmeste 100 kr
    return Math.max(0, Math.ceil(finalDiscount / 100) * 100);
}

/**
 * Format tal til dansk valuta format
 * @param {number} amount - Beløb
 * @returns {string} Formateret streng
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format tal med tusinde-separator
 * @param {number} num - Tal
 * @returns {string} Formateret streng
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('da-DK').format(num);
}

/**
 * Beregn måned-for-måned pris for en plan (inkl. intro-pris transition)
 * @param {Object} plan - Plan objekt
 * @param {number} quantity - Antal linjer
 * @returns {Array<number>} Array med priser for hver måned (6 måneder)
 */
export function calculateMonthlyBreakdown(plan, quantity = 1) {
    if (!plan) return [0, 0, 0, 0, 0, 0];

    const monthlyPrices = [];

    for (let month = 1; month <= 6; month++) {
        let price;

        // Hvis der er intro-pris og vi stadig er i intro-perioden
        if (plan.introPrice && plan.introMonths && month <= plan.introMonths) {
            price = plan.introPrice * quantity;
        } else {
            price = plan.price * quantity;
        }

        monthlyPrices.push(price);
    }

    return monthlyPrices;
}
