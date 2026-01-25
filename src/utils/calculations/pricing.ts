/**
 * Pricing Calculations
 * 
 * Handles core price calculations for plans, discounts, and earnings.
 */

import { CAMPAIGN, PRICING, OPTIMIZER } from '../../constants/businessRules.js';
import { Plan, CartItem, CustomerTotal, OurOfferTotal } from './types.js';

/**
 * Tjek om kampagnen er aktiv for en plan
 * @param plan - Plan objekt med campaignExpiresAt (valgfri)
 * @returns True hvis kampagnen er aktiv
 */
export function isCampaignActive(plan: Plan | null | undefined): boolean {
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
 * @param plan - Plan objekt
 * @returns Aktuel pris
 */
export function getCurrentPrice(plan: Plan | null | undefined): number {
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
 * @param plan - Plan objekt med price, introPrice (valgfri), introMonths (valgfri)
 * @param quantity - Antal linjer/abonnementer
 * @returns Total 6-måneders pris for alle linjer
 */
export function calculateSixMonthPrice(plan: Plan | null | undefined, quantity: number = 1): number {
    if (!plan) return 0;

    // Hent den aktuelle pris (kampagnepris hvis aktiv, ellers original/normal pris)
    const currentPrice = getCurrentPrice(plan);

    // Hvis der er intro-pris (fx 199 kr i 3 måneder, derefter 299 kr)
    if (plan.introPrice != null && plan.introMonths) {
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
 * @param plan - Plan objekt
 * @param quantity - Antal linjer
 * @returns Gennemsnitlig månedlig pris
 */
export function calculateMonthlyPrice(plan: Plan | null | undefined, quantity: number = 1): number {
    if (!plan) return 0;

    // Hvis intro-pris: beregn gennemsnit over 6 måneder
    if (plan.introPrice != null && plan.introMonths) {
        const sixMonthTotal = calculateSixMonthPrice(plan, quantity);
        return sixMonthTotal / 6; // Gennemsnitlig månedlig pris
    }

    // Normal pris: brug aktuel pris (kampagnepris hvis aktiv) × antal linjer
    const currentPrice = getCurrentPrice(plan);
    return currentPrice * quantity;
}

/**
 * Beregn CBB MIX pris for en plan
 * @param plan - Plan objekt
 * @param mixCount - Antal CBB MIX tjenester (2-8)
 * @returns CBB MIX pris
 */
export function calculateCBBMixPrice(plan: Plan, mixCount: number): number {
    if (!plan.cbbMixAvailable || !mixCount || !plan.cbbMixPricing) return 0;
    return plan.cbbMixPricing[mixCount] || 0;
}

/**
 * Beregn plan med CBB MIX
 * @param plan - Plan objekt
 * @param quantity - Antal linjer
 * @param mixCount - Antal CBB MIX tjenester
 * @returns Total 6-måneders pris inkl. CBB MIX
 */
export function calculatePlanWithCBBMix(plan: Plan, quantity: number = 1, mixCount: number = 0): number {
    const basePrice = calculateSixMonthPrice(plan, quantity);
    const mixPrice = calculateCBBMixPrice(plan, mixCount) * 6; // 6 måneder
    return basePrice + mixPrice;
}

/**
 * Beregn Telenor familie-rabat
 * @param cartItems - Array af kurv-items
 * @returns Total månedlig rabat i kr
 */
export function calculateTelenorFamilyDiscount(cartItems: CartItem[] | null | undefined): number {
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
 * @param cartItems - Array af kurv-items
 * @returns Total indtjening
 */
export function calculateTotalEarnings(cartItems: CartItem[] | null | undefined): number {
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
            if (item.cbbMixEnabled && item.cbbMixCount && item.cbbMixCount > 0) {
                earnings += PRICING.CBB_MIX_EARNINGS * item.quantity;
            }
        }

        return total + earnings;
    }, 0);
}

/**
 * Beregn kunde totaler (hvad kunden betaler nu)
 * @param currentMobileCost - Nuværende mobiludgifter pr. måned (TOTAL for alle linjer)
 * @param streamingCost - Total streaming-udgifter pr. måned
 * @param originalItemPrice - Varens pris inden rabat (engangspris, valgfri)
 * @returns { monthly: number, sixMonth: number }
 */
export function calculateCustomerTotal(currentMobileCost: number, streamingCost: number, originalItemPrice: number = 0): CustomerTotal {
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
 * @param cartItems - Array af kurv-items
 * @param streamingCost - Ikke-inkluderet streaming-omkostning pr. måned
 * @param cashDiscount - Kontant rabat (engangsrabat, valgfri)
 * @param originalItemPrice - Varens pris inden rabat (engangspris, valgfri)
 * @param buybackAmount - RePOWER indbytningspris (engangsrabat, valgfri)
 * @returns { monthly: number, sixMonth: number, telenorDiscount: number }
 */
export function calculateOurOfferTotal(cartItems: CartItem[] | null | undefined, streamingCost: number = 0, cashDiscount: number = 0, originalItemPrice: number = 0, buybackAmount: number = 0): OurOfferTotal {
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

    // ===== TRIN 4: KONTANT RABAT OG INDBYTNING =====
    // Total før kontant rabat og indbytning
    const beforeEngangsRabatter = afterFamilyDiscount + streamingSixMonth;

    // Træk kontant rabat og indbytning fra (engangsrabat)
    const afterEngangsRabatter = beforeEngangsRabatter - (cashDiscount || 0) - (buybackAmount || 0);

    // ===== TRIN 5: ENGANGSBETALINGER =====
    // Tilføj varens pris (engangsbetaling)
    const sixMonth = afterEngangsRabatter + (originalItemPrice || 0);

    return {
        monthly: afterEngangsRabatter / 6, // Månedlig beregnes uden engangsbetalinger (abonnementer + streaming - rabatter)
        sixMonth: Math.max(0, sixMonth), // Må ikke være negativ
        telenorDiscount // Månedlig Telenor rabat (til visning)
    };
}

/**
 * Beregn besparelse (forskellen mellem kundens nuværende situation og vores tilbud)
 * @param customerTotal - Kunde 6-måneders total (hvad de betaler nu)
 * @param ourTotal - Vores 6-måneders total (hvad de betaler med os)
 * @returns Besparelse i kr (positiv = besparelse, negativ = mersalg)
 */
export function calculateSavings(customerTotal: number, ourTotal: number): number {
    return customerTotal - ourTotal;
}

/**
 * Auto-justér kontant rabat for minimum besparelse
 * @param customerTotal - Kunde 6-måneders total
 * @param ourTotalBeforeDiscount - Vores total før kontant rabat
 * @param minimumSavings - Minimum ønsket besparelse (standard: 500)
 * @param totalEarnings - Total engangsindtjening fra løsningen (ikke løbende)
 * @returns Nødvendig kontant rabat
 */
export function autoAdjustCashDiscount(customerTotal: number, ourTotalBeforeDiscount: number, minimumSavings: number = OPTIMIZER.DEFAULT_MIN_SAVINGS, totalEarnings: number = 0): number {
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
 * @param amount - Beløb
 * @returns Formateret streng
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format tal med tusinde-separator
 * @param num - Tal
 * @returns Formateret streng
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('da-DK').format(num);
}

/**
 * Beregn måned-for-måned pris for en plan (inkl. intro-pris transition)
 * @param plan - Plan objekt
 * @param quantity - Antal linjer
 * @returns Array med priser for hver måned (6 måneder)
 */
export function calculateMonthlyBreakdown(plan: Plan | null | undefined, quantity: number = 1): number[] {
    if (!plan) return [0, 0, 0, 0, 0, 0];

    const monthlyPrices: number[] = [];

    for (let month = 1; month <= 6; month++) {
        let price: number;

        // Hvis der er intro-pris og vi stadig er i intro-perioden
        if (plan.introPrice != null && plan.introMonths && month <= plan.introMonths) {
            price = plan.introPrice * quantity;
        } else {
            price = plan.price * quantity;
        }

        monthlyPrices.push(price);
    }

    return monthlyPrices;
}

/**
 * Beregn effektiv hardware pris efter besparelse
 * @param hardwarePrice - Original hardware pris
 * @param savings - Total besparelse (6 mdr)
 * @returns Effektiv pris
 */
export function calculateEffectiveHardwarePrice(hardwarePrice: number, savings: number): number {
    return (hardwarePrice || 0) - (savings || 0);
}
