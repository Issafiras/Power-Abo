/**
 * Beregningslogik for mobilabonnementer og streaming
 * 
 * Dette modul håndterer alle beregninger relateret til:
 * - 6-måneders priser (inkl. intro-priser)
 * - Månedlige priser (gennemsnitlige hvis intro-pris)
 * - Telenor familie-rabatter
 * - Total indtjening (engangsindtjening fra abonnementer)
 * - Streaming coverage (hvad er inkluderet vs. ikke-inkluderet)
 * - Kunde totaler (hvad kunden betaler nu)
 * - Vores tilbud totaler (hvad kunden betaler med os)
 * - Besparelse (forskellen mellem kunde og vores total)
 * 
 * BEREGNINGER ER GENNEMSKUELIGE FOR SÆLGERNE:
 * - Alle funktioner har klare kommentarer
 * - Eksempler vises i dokumentationen
 * - Beregningslogik er skridt-for-skridt forklaret
 */


// Konstanter
export const SETUP_FEE_PER_LINE = 99; // Oprettelsesgebyr per mobilabonnement (engangsbetaling)

/**
 * Beregn 6-måneders pris for en plan med intro-pris håndtering
 * 
 * EKSEMPEL (med intro-pris):
 * - Plan: 299 kr/md, intro: 199 kr i 3 måneder
 * - Antal linjer: 2
 * - Beregning:
 *   1) Intro total: 199 kr × 3 måneder × 2 linjer = 1.194 kr
 *   2) Normal total: 299 kr × (6-3) måneder × 2 linjer = 1.794 kr
 *   3) Total 6 måneder: 1.194 + 1.794 = 2.988 kr
 * 
 * EKSEMPEL (uden intro-pris):
 * - Plan: 299 kr/md
 * - Antal linjer: 2
 * - Beregning: 299 kr × 6 måneder × 2 linjer = 3.588 kr
 * 
 * @param {Object} plan - Plan objekt med price, introPrice (valgfri), introMonths (valgfri)
 * @param {number} quantity - Antal linjer/abonnementer
 * @returns {number} Total 6-måneders pris for alle linjer
 */
export function calculateSixMonthPrice(plan, quantity = 1) {
  if (!plan) return 0;

  // Hvis der er intro-pris (fx 199 kr i 3 måneder, derefter 299 kr)
  if (plan.introPrice && plan.introMonths) {
    // Step 1: Beregn intro-pris for intro-perioden
    const introTotal = plan.introPrice * plan.introMonths * quantity;
    
    // Step 2: Beregn normal pris for resterende måneder
    const remainingMonths = 6 - plan.introMonths;
    const normalTotal = plan.price * remainingMonths * quantity;
    
    // Step 3: Total = intro + normal
    return introTotal + normalTotal;
  }

  // Normal pris (ingen intro-pris): pris × 6 måneder × antal linjer
  return plan.price * 6 * quantity;
}

/**
 * Beregn månedlig pris for en plan (gennemsnit over 6 måneder hvis intro-pris)
 * 
 * Dette giver den gennemsnitlige månedlige pris over 6 måneder.
 * Hvis der er intro-pris, tager vi gennemsnittet af hele 6-måneders perioden.
 * 
 * EKSEMPEL (med intro-pris):
 * - 6-måneders total: 2.988 kr
 * - Gennemsnit/md: 2.988 kr / 6 = 498 kr/md
 * 
 * EKSEMPEL (uden intro-pris):
 * - Plan: 299 kr/md
 * - Antal linjer: 2
 * - Resultat: 299 kr × 2 = 598 kr/md
 * 
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

  // Normal pris: bare månedlig pris × antal linjer
  return plan.price * quantity;
}

/**
 * Beregn Telenor familie-rabat
 * 
 * Telenor tilbyder 50 kr/md rabat pr. ekstra linje (fra 2. linje og opefter).
 * 
 * RABAT LOGIK:
 * - 1 linje: Ingen rabat (0 kr/md)
 * - 2 linjer: (2-1) × 50 = 50 kr/md rabat
 * - 3 linjer: (3-1) × 50 = 100 kr/md rabat
 * - 4 linjer: (4-1) × 50 = 150 kr/md rabat
 * - osv.
 * 
 * EKSEMPEL:
 * - 3 Telenor abonnementer med familyDiscount
 * - Beregning: (3 - 1) × 50 = 100 kr/md rabat
 * - Over 6 måneder: 100 kr × 6 = 600 kr rabat
 * 
 * @param {Array} cartItems - Array af kurv-items, hvor hvert item har { plan: { provider, familyDiscount }, quantity }
 * @returns {number} Total månedlig rabat i kr
 */
export function calculateTelenorFamilyDiscount(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  // Step 1: Tæl antal Telenor-linjer med familyDiscount
  const telenorLines = cartItems
    .filter(item => item.plan.provider === 'telenor' && item.plan.familyDiscount)
    .reduce((total, item) => total + item.quantity, 0);

  // Step 2: Beregn rabat = (antal_linjer - 1) × 50 kr/md
  // Første linje giver ingen rabat, hver ekstra linje giver 50 kr/md
  if (telenorLines <= 1) return 0;
  return (telenorLines - 1) * 50;
}

/**
 * Beregn total indtjening fra kurv
 * @param {Array} cartItems - Array af kurv-items
 * @returns {number} Total indtjening
 */
export function calculateTotalEarnings(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

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
    return total + (item.plan.earnings * item.quantity);
  }, 0);
}

/**
 * Check om streaming er inkluderet i valgte planer
 * @param {Array} cartItems - Array af kurv-items
 * @param {Array} selectedStreaming - Array af valgte streaming-ID'er
 * @returns {Object} { included: Array, notIncluded: Array }
 */
export function checkStreamingCoverage(cartItems, selectedStreaming) {
  if (!selectedStreaming || selectedStreaming.length === 0) {
    return { included: [], notIncluded: [] };
  }

  // Hent alle inkluderede streaming-tjenester fra planer
  const includedStreaming = new Set();
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
 * Beregn kunde totaler (hvad kunden betaler nu)
 * 
 * Dette beregner hvad kunden betaler i deres nuværende situation.
 * 
 * BEREGNING:
 * 1) Månedlig total = mobil + streaming
 * 2) 6-måneders total = (månedlig × 6) + varens pris (engangsbetaling)
 * 
 * EKSEMPEL:
 * - Mobil: 299 kr/md (total for alle linjer)
 * - Streaming: 149 kr/md (Netflix 99 + Viaplay 50)
 * - Varens pris: 1.000 kr (engangsbetaling)
 * 
 * Beregning:
 * - Månedlig: 299 + 149 = 448 kr/md
 * - 6 måneder: (448 × 6) + 1.000 = 2.688 + 1.000 = 3.688 kr
 * 
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
 * 
 * Dette er den komplette beregning af vores tilbud til kunden.
 * Beregningen sker i flere trin for at være gennemskuelig:
 * 
 * BEREGNINGS TRIN (top-down):
 * 
 * 1) ABONNEMENT PRISER
 *    - For hver plan: beregn 6-måneders pris (inkl. intro-priser)
 *    - Tilføj CBB Mix pris hvis aktiv
 *    - Sum = total abonnementer over 6 måneder
 * 
 * 2) FAMILIE RABAT
 *    - Beregn Telenor familie-rabat (50 kr/md pr. ekstra linje)
 *    - Træk rabat fra (6-måneders rabat = månedlig × 6)
 * 
 * 3) STREAMING TILLÆG
 *    - Tilføj streaming-tjenester der IKKE er inkluderet
 *    - Beregning: ikke-inkluderet streaming × 6 måneder
 * 
 * 4) KONTANT RABAT
 *    - Træk kontant rabat fra (hvis aktiv)
 * 
 * 5) ENGANGSBETALINGER
 *    - Tilføj varens pris (hvis relevant)
 *    - Tilføj oprettelsesgebyr (99 kr pr. linje)
 *    - Træk oprettelsesgebyr rabat fra (hvis gratis oprettelse)
 * 
 * EKSEMPEL:
 * - 2× Telmore 299 kr/md planer
 * - Netflix inkluderet, Viaplay 50 kr/md ikke-inkluderet
 * - Ingen kontant rabat
 * - Varens pris: 1.000 kr
 * 
 * Beregning:
 * 1) Abonnementer: 299 kr × 6 × 2 = 3.588 kr
 * 2) Familie-rabat: 0 kr (kun Telmore, ikke Telenor)
 * 3) Streaming tillæg: 50 kr × 6 = 300 kr
 * 4) Kontant rabat: 0 kr
 * 5) Oprettelsesgebyr: 99 kr × 2 = 198 kr
 * 6) Varens pris: 1.000 kr
 * 
 * Total: 3.588 + 300 + 198 + 1.000 = 5.086 kr (6 måneder)
 * Månedlig: (3.588 + 300) / 6 = 648 kr/md
 * 
 * @param {Array} cartItems - Array af kurv-items
 * @param {number} streamingCost - Ikke-inkluderet streaming-omkostning pr. måned
 * @param {number} cashDiscount - Kontant rabat (engangsrabat, valgfri)
 * @param {number} originalItemPrice - Varens pris inden rabat (engangspris, valgfri)
 * @param {boolean} freeSetup - Om oprettelse er gratis (rabat på oprettelsesgebyr)
 * @returns {Object} { monthly: number, sixMonth: number, telenorDiscount: number, setupFee: number, setupFeeDiscount: number }
 */
export function calculateOurOfferTotal(cartItems, streamingCost = 0, cashDiscount = 0, originalItemPrice = 0, freeSetup = false) {
  if (!cartItems || cartItems.length === 0) {
    return { monthly: 0, sixMonth: 0, telenorDiscount: 0, setupFee: 0, setupFeeDiscount: 0 };
  }

  // ===== TRIN 1: ABONNEMENT PRISER =====
  // Beregn totalt antal mobilabonnementer
  const totalLines = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Beregn oprettelsesgebyr (99 kr pr. linje, engangsbetaling)
  const setupFee = totalLines * SETUP_FEE_PER_LINE;
  const setupFeeDiscount = freeSetup ? setupFee : 0; // Rabat hvis gratis oprettelse

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
  // Tilføj varens pris og oprettelsesgebyr (engangsbetalinger)
  // Hvis gratis oprettelse, træk oprettelsesgebyret fra som rabat
  const sixMonth = afterCashDiscount + (originalItemPrice || 0) + setupFee - setupFeeDiscount;

  return {
    monthly: afterCashDiscount / 6, // Månedlig beregnes uden engangsbetalinger (abonnementer + streaming - rabatter)
    sixMonth: Math.max(0, sixMonth), // Må ikke være negativ
    telenorDiscount, // Månedlig Telenor rabat (til visning)
    setupFee, // Total oprettelsesgebyr
    setupFeeDiscount // Rabat på oprettelsesgebyr (hvis gratis oprettelse)
  };
}

/**
 * Beregn besparelse (forskellen mellem kundens nuværende situation og vores tilbud)
 * 
 * BEREGNING:
 * Besparelse = Kundens 6-måneders total - Vores 6-måneders total
 * 
 * RESULTAT:
 * - Positivt tal = kunden sparer penge (godt!)
 * - Negativt tal = kunden betaler mere (mersalg)
 * - 0 = samme pris
 * 
 * EKSEMPEL:
 * - Kundens total (6 måneder): 3.688 kr
 * - Vores total (6 måneder): 5.086 kr
 * - Besparelse: 3.688 - 5.086 = -1.398 kr (mersalg på 1.398 kr)
 * 
 * EKSEMPEL (besparelse):
 * - Kundens total (6 måneder): 5.000 kr
 * - Vores total (6 måneder): 4.000 kr
 * - Besparelse: 5.000 - 4.000 = 1.000 kr (kunden sparer 1.000 kr)
 * 
 * @param {number} customerTotal - Kunde 6-måneders total (hvad de betaler nu)
 * @param {number} ourTotal - Vores 6-måneders total (hvad de betaler med os)
 * @returns {number} Besparelse i kr (positiv = besparelse, negativ = mersalg)
 */
export function calculateSavings(customerTotal, ourTotal) {
  return customerTotal - ourTotal;
}

/**
 * Auto-justér kontant rabat for minimum besparelse
 * Sælger-strategi: Giv noget af indtjeningen tilbage som rabat for at overbevise kunden
 * @param {number} customerTotal - Kunde 6-måneders total
 * @param {number} ourTotalBeforeDiscount - Vores total før kontant rabat
 * @param {number} minimumSavings - Minimum ønsket besparelse (standard: 500)
 * @param {number} totalEarnings - Total engangsindtjening fra løsningen (ikke løbende)
 * @returns {number} Nødvendig kontant rabat
 */
export function autoAdjustCashDiscount(customerTotal, ourTotalBeforeDiscount, minimumSavings = 500, totalEarnings = 0) {
  const currentSavings = customerTotal - ourTotalBeforeDiscount;
  
  // Hvis kunden allerede har god besparelse, ingen rabat nødvendig
  if (currentSavings >= minimumSavings) {
    return 0;
  }

  // Beregn hvor meget kunden betaler ekstra (negativ besparelse = mersalg)
  const additionalCost = Math.max(0, -currentSavings);
  
  // Sælger-strategi: Hvis kunden betaler for meget mere, giv noget af indtjeningen tilbage
  // Men vi skal beholde minimum 40% af indtjeningen (vi skal stadig tjene penge)
  // Bemærk: Indtjening er engangsindtjening, så vi kan give op til 60% som rabat
  const maxDiscountFromEarnings = Math.floor(totalEarnings * 0.6); // Maks 60% af engangsindtjening som rabat
  
  // Beregn nødvendig rabat for at nå minimum besparelse
  const neededDiscountForSavings = minimumSavings - currentSavings;
  
  // Hvis kunden betaler mere end 300 kr ekstra, giv noget af indtjeningen tilbage
  // Dette gør det mere attraktivt for kunden at skifte
  let suggestedDiscount = 0;
  
  if (additionalCost > 300) {
    // Giv op til 50% af den ekstra omkostning tilbage, men maksimalt 60% af indtjening
    const discountFromCost = Math.floor(additionalCost * 0.5);
    suggestedDiscount = Math.min(discountFromCost, maxDiscountFromEarnings);
  }
  
  // Kombiner: Tag den højeste af de to (for at sikre minimum besparelse ELLER give rabat fra indtjening)
  const finalDiscount = Math.max(neededDiscountForSavings, suggestedDiscount);
  
  // Rund op til nærmeste 100 kr (sælger-venligt beløb)
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
 * Check CBB MIX kompatibilitet
 * @param {Array} cartItems - Array af kurv-items
 * @returns {Object} { compatible: boolean, message: string }
 */
export function checkCBBMixCompatibility(cartItems) {
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
 * @param {Array} cartItems - Array af kurv-items
 * @param {Array} selectedStreaming - Array af valgte streaming-ID'er
 * @returns {Object} { included: Array, notIncluded: Array, cbbMixSlots: number }
 */
export function checkCBBMixStreamingCoverage(cartItems, selectedStreaming) {
  if (!selectedStreaming || selectedStreaming.length === 0) {
    return { included: [], notIncluded: [], cbbMixSlots: 0 };
  }

  let totalCBBMixSlots = 0;
  
  cartItems.forEach(item => {
    if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount > 0) {
      totalCBBMixSlots += item.cbbMixCount * item.quantity;
    }
  });

  // Hvis der er CBB MIX slots tilgængelige
  if (totalCBBMixSlots > 0) {
    const included = selectedStreaming.slice(0, totalCBBMixSlots);
    const notIncluded = selectedStreaming.slice(totalCBBMixSlots);
    
    return { included, notIncluded, cbbMixSlots: totalCBBMixSlots };
  }

  return { included: [], notIncluded: selectedStreaming, cbbMixSlots: 0 };
}

/**
 * Opdateret streaming coverage check med CBB MIX support
 * @param {Array} cartItems - Array af kurv-items
 * @param {Array} selectedStreaming - Array af valgte streaming-ID'er
 * @returns {Object} { included: Array, notIncluded: Array }
 */
export function checkStreamingCoverageWithCBBMix(cartItems, selectedStreaming) {
  if (!selectedStreaming || selectedStreaming.length === 0) {
    return { included: [], notIncluded: [] };
  }

  // Hent alle inkluderede streaming-tjenester fra planer
  const includedStreaming = new Set();
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
    if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount > 0) {
      totalStreamingSlots += item.cbbMixCount * item.quantity;
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
  const numberOfLines = options.requiredLines || 1;
  const {
    maxPlansToConsider = 3, // Maks antal forskellige planer at overveje
    preferSavings = true, // Prioriter besparelse over indtjening
    minSavings = -Infinity, // Minimum besparelse krævet
    maxLines = 5, // Maks antal linjer totalt
    requiredLines = 1, // Påkrævet antal linjer
    excludedProviders = [] // Array af provider navne der skal ekskluderes (fx ['telmore', 'telenor', 'cbb'])
  } = options;

  // Filtrer planer - ekskluder business planer og bredbånd hvis ikke relevant
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mobilePlans = availablePlans.filter(plan => {
    if (plan.business) return false;
    if (plan.type === 'broadband') return false;
    
    // ALTID ekskluder CBB planer
    if (plan.provider === 'cbb') return false;
    
    // KRITISK: Ekskluder planer med negativ eller nul indtjening
    // Vi skal kun vælge løsninger hvor vi tjener penge
    const earnings = plan.earnings || 0;
    if (earnings <= 0) return false;
    
    // Ekskluder planer fra eksisterende brands
    if (excludedProviders && excludedProviders.length > 0) {
      const planProvider = plan.provider || '';
      const isExcluded = excludedProviders.some(excluded => {
        // Match både eksakt og med variante navne (fx 'telenor' matcher 'telenor-bredbånd')
        return planProvider.toLowerCase() === excluded.toLowerCase() ||
               planProvider.toLowerCase().startsWith(excluded.toLowerCase() + '-');
      });
      if (isExcluded) {
        return false;
      }
    }
    
    // Tjek expiresAt
    if (plan.expiresAt) {
      const expiresAtDate = new Date(plan.expiresAt);
      expiresAtDate.setHours(23, 59, 59, 999);
      if (today > expiresAtDate) return false;
    }
    
    // Tjek availableFrom
    if (plan.availableFrom) {
      const availableFromDate = new Date(plan.availableFrom);
      availableFromDate.setHours(0, 0, 0, 0);
      if (today < availableFromDate) return false;
    }
    
    return true;
  });

  if (mobilePlans.length === 0) {
    return {
      cartItems: [],
      explanation: 'Ingen tilgængelige planer fundet',
      savings: 0
    };
  }

  // Beregn streaming-pris hvis funktion er givet
  const getPrice = getStreamingPrice || ((id) => 100); // Fallback til 100 kr
  const streamingCost = selectedStreaming.reduce((sum, id) => sum + getPrice(id), 0);
  // Kundens mobiludgifter er allerede totalt (ikke pr. linje)
  const customerTotal = calculateCustomerTotal(customerMobileCost, streamingCost, originalItemPrice);

  let bestSolution = null;
  let bestSavings = -Infinity;
  let bestEarnings = -Infinity;
  let bestExplanation = '';
  
  // Maksimal tilladt mersalg (kunden må betale maksimalt 900 kr mere)
  const MAX_ADDITIONAL_COST = 900; // 6 måneder
  
  // Funktion til at beregne score baseret på indtjening og besparelse
  // Prioriterer indtjening højere end besparelse
  const calculateScore = (savings, earnings) => {
    // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
    if (savings < -MAX_ADDITIONAL_COST) {
      return -Infinity; // Diskvalificer løsninger der er for dyre
    }
    // KRITISK: Vi skal ALTID tjene penge
    if (earnings <= 0) {
      return -Infinity; // Diskvalificer løsninger uden indtjening
    }
    // Prioriter indtjening meget højere end besparelse
    // Score = indtjening * 10 + besparelse (normaliseret)
    // Dette sikrer at høj indtjening altid vinder, selv hvis kunden betaler lidt mere
    return (earnings * 10) + savings;
  };

  // Hvis ingen streaming-tjenester, find plan med højeste indtjening
  // Prioriter indtjening højere end pris - maksimer indtjening
  if (selectedStreaming.length === 0) {
    // Test alle planer og find den bedste baseret på score (indtjening prioriteret)
    let bestPlanForNoStreaming = null;
    let bestScoreForNoStreaming = -Infinity;
    let bestSavingsForNoStreaming = 0;
    let bestEarningsForNoStreaming = 0;

    for (const plan of mobilePlans) {
      if ((plan.earnings || 0) <= 0) continue; // Skip planer uden indtjening
      
      const testCart = [{ plan, quantity: requiredLines, cbbMixEnabled: false, cbbMixCount: 0 }];
      const ourTotal = calculateOurOfferTotal(testCart, 0, 0, originalItemPrice);
      const savings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
      const earnings = calculateTotalEarnings(testCart);
      
      // Kun overvej hvis kunden maksimalt betaler 900 kr mere
      if (savings >= -MAX_ADDITIONAL_COST && earnings > 0) {
        const score = calculateScore(savings, earnings);
        if (score > bestScoreForNoStreaming) {
          bestScoreForNoStreaming = score;
          bestPlanForNoStreaming = plan;
          bestSavingsForNoStreaming = savings;
          bestEarningsForNoStreaming = earnings;
        }
      }
    }

    if (bestPlanForNoStreaming) {
      const testCart = [{ plan: bestPlanForNoStreaming, quantity: requiredLines, cbbMixEnabled: false, cbbMixCount: 0 }];
      const savingsText = bestSavingsForNoStreaming >= 0 
        ? `Besparelse: ${formatCurrency(bestSavingsForNoStreaming)}` 
        : `Mersalg: ${formatCurrency(Math.abs(bestSavingsForNoStreaming))}`;
      return {
        cartItems: testCart,
        explanation: `Forslag: ${bestPlanForNoStreaming.name} fra ${bestPlanForNoStreaming.provider.toUpperCase()} (${requiredLines} linje${requiredLines > 1 ? 'r' : ''}) - ${savingsText} (Indtjening: ${formatCurrency(bestEarningsForNoStreaming)})`,
        savings: bestSavingsForNoStreaming,
        earnings: bestEarningsForNoStreaming
      };
    }
  }

  // Find voice-only planer (mobilabonnementer uden streaming)
  // Sorteret efter indtjening (højest først) - maksimer indtjening
  const voiceOnlyPlans = mobilePlans
    .filter(plan => {
      // Skal ikke have streaming slots
      if (plan.streamingCount > 0) return false;
      // Skal ikke have specifikke streaming-tjenester
      if (plan.streaming && plan.streaming.length > 0) return false;
      // Skal ikke have CBB Mix
      if (plan.cbbMixAvailable) return false;
      // Alt andet er voice-only (inkl. Fri Data planer)
      return true;
    })
    .sort((a, b) => {
      // Først: Prioriter høj indtjening (maksimer indtjening)
      const earningsA = a.earnings || 0;
      const earningsB = b.earnings || 0;
      if (earningsB !== earningsA) {
        return earningsB - earningsA; // Højeste indtjening først
      }
      // Hvis samme indtjening, vælg billigste (for kundens skyld)
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      return priceA - priceB;
    });
  

  // Find planer med streaming coverage
  const plansWithStreaming = mobilePlans.filter(plan => 
    plan.streamingCount > 0 || 
    (plan.streaming && plan.streaming.length > 0) ||
    plan.cbbMixAvailable
  );

  // Sorter streaming-planer efter indtjening (højest først)
  const sortedStreamingPlans = [...plansWithStreaming].sort((a, b) => {
    const earningsA = a.earnings || 0;
    const earningsB = b.earnings || 0;
    if (earningsB !== earningsA) {
      return earningsB - earningsA; // Højeste indtjening først
    }
    // Hvis samme indtjening, vælg billigste
    return calculateSixMonthPrice(a, 1) - calculateSixMonthPrice(b, 1);
  });


  // Strategi 1: En plan med streaming + voice-only planer til resten
  if (selectedStreaming.length > 0 && sortedStreamingPlans.length > 0 && voiceOnlyPlans.length > 0) {
    for (const streamingPlan of sortedStreamingPlans.slice(0, 5)) {
      let streamingLinesNeeded = 1;
      let streamingSlotsAvailable = 0;
      
      // Beregn hvor mange linjer der skal bruges til streaming
      if (streamingPlan.streamingCount > 0) {
        streamingSlotsAvailable = streamingPlan.streamingCount;
        streamingLinesNeeded = Math.ceil(selectedStreaming.length / streamingSlotsAvailable);
      } else if (streamingPlan.cbbMixAvailable) {
        // CBB Mix kan dække op til 8 tjenester på 1 linje
        streamingLinesNeeded = 1;
        streamingSlotsAvailable = Math.min(selectedStreaming.length, 8);
      } else {
        continue; // Skip planer uden streaming slots
      }
      
      // Hvis vi har flere linjer end nødvendigt til streaming, brug voice-only til resten
      const remainingLines = requiredLines - streamingLinesNeeded;
      
      if (remainingLines >= 0 && streamingLinesNeeded <= maxLines) {
        // Prøv forskellige voice-only planer for at finde den bedste kombination
        // Test de første 5 voice-only planer (sorteret efter indtjening)
        const voicePlansToTest = voiceOnlyPlans.slice(0, 5);
        
        for (const voicePlan of voicePlansToTest) {
          const testCart = [];
          
          // Tilføj streaming plan
          if (streamingPlan.cbbMixAvailable) {
            testCart.push({
              plan: streamingPlan,
              quantity: streamingLinesNeeded,
              cbbMixEnabled: true,
              cbbMixCount: Math.min(selectedStreaming.length, 8)
            });
          } else {
            testCart.push({
              plan: streamingPlan,
              quantity: streamingLinesNeeded,
              cbbMixEnabled: false,
              cbbMixCount: 0
            });
          }
          
          // Tilføj voice-only planer til resten
          if (remainingLines > 0) {
            testCart.push({
              plan: voicePlan,
              quantity: remainingLines,
              cbbMixEnabled: false,
              cbbMixCount: 0
            });
          }
          
          const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
          const notIncludedCost = coverage.notIncluded.reduce((sum, id) => sum + getPrice(id), 0);
          const ourTotal = calculateOurOfferTotal(testCart, notIncludedCost, 0, originalItemPrice);
          const savings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
          const earnings = calculateTotalEarnings(testCart);
          const score = calculateScore(savings, earnings);

          const streamingPart = streamingPlan.cbbMixAvailable 
            ? `${streamingPlan.name} med CBB MIX (${Math.min(selectedStreaming.length, 8)} tjenester)`
            : `${streamingPlan.name} (${streamingLinesNeeded}x)`;
          const voicePart = remainingLines > 0 ? ` + ${voicePlan.name} (${remainingLines}x)` : '';
          const reason = `${streamingPart}${voicePart}`;

          // Opdater hvis bedre score (prioriter indtjening)
          // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
          // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
          const currentBestScore = bestSolution ? calculateScore(bestSavings, bestEarnings) : -Infinity;
          
          if (score > currentBestScore && savings >= -MAX_ADDITIONAL_COST && savings >= minSavings && earnings > 0) {
            bestSavings = savings;
            bestEarnings = earnings;
            bestSolution = JSON.parse(JSON.stringify(testCart)); // Deep copy
            const savingsText = savings >= 0 
              ? `Besparelse: ${formatCurrency(savings)}` 
              : `Mersalg: ${formatCurrency(Math.abs(savings))}`;
            bestExplanation = `${reason} - Dækker ${coverage.included.length}/${selectedStreaming.length} streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(earnings)})`;
          }
        }
      }
    }
  }

  // Strategi 2: Hvis ingen streaming-tjenester, brug kun billigste voice-only planer
  if (selectedStreaming.length === 0 && voiceOnlyPlans.length > 0) {
    
    const cheapestPlan = voiceOnlyPlans[0];
    const testCart = [{
      plan: cheapestPlan,
      quantity: requiredLines,
      cbbMixEnabled: false,
      cbbMixCount: 0
    }];
    
    const ourTotal = calculateOurOfferTotal(testCart, 0, 0, originalItemPrice);
    const savings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
    const earnings = calculateTotalEarnings(testCart);
    const score = calculateScore(savings, earnings);

    const currentBestScore = bestSolution ? calculateScore(bestSavings, bestEarnings) : -Infinity;
    
    // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
    // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
    if (score > currentBestScore && savings >= -MAX_ADDITIONAL_COST && savings >= minSavings && earnings > 0) {
      bestSavings = savings;
      bestEarnings = earnings;
      bestSolution = JSON.parse(JSON.stringify(testCart));
      const savingsText = savings >= 0 
        ? `Besparelse: ${formatCurrency(savings)}` 
        : `Mersalg: ${formatCurrency(Math.abs(savings))}`;
      bestExplanation = `${cheapestPlan.name} (${requiredLines}x) - Ingen streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(earnings)})`;
    }
  }

  // Strategi 3: Fallback - hvis ingen voice-only planer, brug billigste planer generelt
  if (!bestSolution && mobilePlans.length > 0) {
    
    const sortedPlans = [...mobilePlans].sort((a, b) => 
      calculateSixMonthPrice(a, 1) - calculateSixMonthPrice(b, 1)
    );
    
    // Prøv forskellige kombinationer af billige planer
    for (let i = 0; i < Math.min(sortedPlans.length, 3); i++) {
      const plan = sortedPlans[i];
      const testCart = [{
        plan,
        quantity: requiredLines,
        cbbMixEnabled: false,
        cbbMixCount: 0
      }];
      
      const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
      const notIncludedCost = coverage.notIncluded.reduce((sum, id) => sum + getPrice(id), 0);
      const ourTotal = calculateOurOfferTotal(testCart, notIncludedCost, 0, originalItemPrice);
      const savings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
      const earnings = calculateTotalEarnings(testCart);
      const score = calculateScore(savings, earnings);

      const currentBestScore = bestSolution ? calculateScore(bestSavings, bestEarnings) : -Infinity;
      
      // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
      // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
      if (score > currentBestScore && savings >= -MAX_ADDITIONAL_COST && savings >= minSavings && earnings > 0) {
        bestSavings = savings;
        bestEarnings = earnings;
        bestSolution = JSON.parse(JSON.stringify(testCart));
        const savingsText = savings >= 0 
          ? `Besparelse: ${formatCurrency(savings)}` 
          : `Mersalg: ${formatCurrency(Math.abs(savings))}`;
        bestExplanation = `${plan.name} (${requiredLines}x) - Dækker ${coverage.included.length}/${selectedStreaming.length} streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(earnings)})`;
      }
    }
  }

  // Hvis ingen god løsning fundet, prøv at finde planer med høj indtjening
  // Sorter efter indtjening (højest først) for at maksimere indtjening
  if (!bestSolution || bestSavings < -MAX_ADDITIONAL_COST) {
    // Sorter planer efter indtjening (højest først) for at maksimere indtjening
    const sortedPlans = [...mobilePlans].sort((a, b) => {
      const earningsA = a.earnings || 0;
      const earningsB = b.earnings || 0;
      if (earningsB !== earningsA) {
        return earningsB - earningsA; // Højeste indtjening først
      }
      // Hvis samme indtjening, vælg billigste
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      return priceA - priceB;
    });
    
    // Prøv planer med høj indtjening indtil vi finder en der er acceptabel
    for (const plan of sortedPlans.slice(0, 10)) {
      const testCart = [{
        plan,
        quantity: requiredLines,
        cbbMixEnabled: false,
        cbbMixCount: 0
      }];
      
      const ourTotal = calculateOurOfferTotal(testCart, streamingCost, 0, originalItemPrice);
      const testSavings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
      const testEarnings = calculateTotalEarnings(testCart);
      const testScore = calculateScore(testSavings, testEarnings);
      
      // Accepter hvis kunden maksimalt betaler 900 kr mere OG indtjening er positiv
      if (testSavings >= -MAX_ADDITIONAL_COST && testEarnings > 0) {
        const currentBestScore = bestSolution ? calculateScore(bestSavings, bestEarnings) : -Infinity;
        if (testScore > currentBestScore) {
          bestSolution = testCart;
          bestSavings = testSavings;
          bestEarnings = testEarnings;
          const savingsText = testSavings >= 0 
            ? `Besparelse: ${formatCurrency(testSavings)}` 
            : `Mersalg: ${formatCurrency(Math.abs(testSavings))}`;
          bestExplanation = `Forslag: ${plan.name} (${requiredLines}x) - ${savingsText} (Indtjening: ${formatCurrency(testEarnings)})`;
        }
      }
    }
    
    // Hvis stadig ingen løsning, returner tom array
    if (!bestSolution || bestSavings < -MAX_ADDITIONAL_COST || bestEarnings <= 0) {
      return {
        cartItems: [],
        explanation: `Kunne ikke finde en løsning hvor kunden maksimalt betaler ${formatCurrency(MAX_ADDITIONAL_COST)} mere og der er positiv indtjening`,
        savings: 0,
        earnings: 0
      };
    }
  }

  // Final check: Sikre at løsningen har positiv indtjening før vi returnerer den
  if (bestSolution && bestEarnings <= 0) {
    return {
      cartItems: [],
      explanation: 'Ingen løsning med positiv indtjening fundet',
      savings: 0,
      earnings: 0
    };
  }

  return {
    cartItems: bestSolution || [],
    explanation: bestExplanation || 'Ingen løsning fundet',
    savings: bestSavings || 0,
    earnings: bestEarnings || 0
  };
}

