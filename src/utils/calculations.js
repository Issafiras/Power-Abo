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
// Oprettelsesgebyr er fjernet

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

  // Normal pris: brug aktuel pris (kampagnepris hvis aktiv) × antal linjer
  const currentPrice = getCurrentPrice(plan);
  return currentPrice * quantity;
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

  // Tjek om vi stadig er inden for kampagneperioden (indtil og med 27/11/2025)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const campaignEndDate = new Date('2025-11-27');
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
      earnings += 100 * item.quantity;
      
      // CBB planer med pris >= 129 kr får ekstra 200 kr indtjening pr. linje indtil 27/11/25
      if (isWithinCampaignPeriod && item.plan.price >= 129) {
        earnings += 200 * item.quantity;
      }
    }
    
    return total + earnings;
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
 * 5) Varens pris: 1.000 kr
 * 
 * Total: 3.588 + 300 + 1.000 = 4.888 kr (6 måneder)
 * Månedlig: (3.588 + 300) / 6 = 648 kr/md
 * 
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
    maxPlansToConsider = 3, // Maks antal forskellige planer at overveje
    preferSavings = true, // Prioriter besparelse over indtjening
    minSavings = -Infinity, // Minimum besparelse krævet
    maxLines = 5, // Maks antal linjer totalt
    requiredLines = numberOfLines, // Påkrævet antal linjer
    excludedProviders = [] // Array af provider navne der skal ekskluderes (fx ['telmore', 'telenor', 'cbb'])
  } = options;

  // Valider at requiredLines er et gyldigt tal
  const validRequiredLines = Number.isInteger(requiredLines) && requiredLines > 0 && requiredLines <= 20
    ? requiredLines 
    : 1;
  
  // Valider at maxLines er et gyldigt tal
  const validMaxLines = Number.isInteger(maxLines) && maxLines > 0 && maxLines <= 20
    ? maxLines 
    : 5;

  // Valider at excludedProviders er et array
  const validExcludedProviders = Array.isArray(excludedProviders) ? excludedProviders : [];

  // Valider numeriske input
  const validCustomerMobileCost = Number.isFinite(customerMobileCost) && customerMobileCost >= 0
    ? customerMobileCost 
    : 0;
  
  const validOriginalItemPrice = Number.isFinite(originalItemPrice) && originalItemPrice >= 0
    ? originalItemPrice 
    : 0;

  // Valider minSavings
  const validMinSavings = Number.isFinite(minSavings) ? minSavings : -Infinity;

  // Filtrer planer - ekskluder business planer og bredbånd hvis ikke relevant
  const today = new Date();
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
    
    // ALTID ekskluder CBB planer
    if (plan.provider === 'cbb') return false;
    
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
    // VIGTIGT: Kun ekskluder hvis expiresAt er sat (ikke campaignExpiresAt)
    // campaignExpiresAt betyder kun at kampagneprisen udløber, ikke planen selv
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
      savings: 0
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

  let bestSolution = null;
  let bestSavings = -Infinity;
  let bestEarnings = -Infinity;
  let bestExplanation = '';
  let bestScore = -Infinity; // Gem den bedste score inkl. bonus
  
  // Maksimal tilladt mersalg (kunden må betale maksimalt 900 kr mere)
  const MAX_ADDITIONAL_COST = 900; // 6 måneder
  
  // Funktion til at beregne score baseret på indtjening og besparelse
  // Prioriterer indtjening højere end besparelse
  const calculateScore = (savings, earnings) => {
    // Valider input
    const validSavings = Number.isFinite(savings) ? savings : -Infinity;
    const validEarnings = Number.isFinite(earnings) ? earnings : 0;
    
    // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
    if (validSavings < -MAX_ADDITIONAL_COST) {
      return -Infinity; // Diskvalificer løsninger der er for dyre
    }
    // KRITISK: Vi skal ALTID tjene penge
    if (validEarnings <= 0) {
      return -Infinity; // Diskvalificer løsninger uden indtjening
    }
    // Prioriter indtjening meget højere end besparelse
    // Score = indtjening * 10 + besparelse (normaliseret)
    // Dette sikrer at høj indtjening altid vinder, selv hvis kunden betaler lidt mere
    const score = (validEarnings * 10) + validSavings;
    // Valider at score er et gyldigt tal
    return Number.isFinite(score) ? score : -Infinity;
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
      // Defensive check
      if (!plan || typeof plan !== 'object') continue;
      
      const planEarnings = (plan.earnings != null && Number.isFinite(plan.earnings)) ? plan.earnings : 0;
      if (planEarnings <= 0) continue; // Skip planer uden indtjening
      
      try {
        const testCart = [{ plan, quantity: validRequiredLines, cbbMixEnabled: false, cbbMixCount: 0 }];
        const ourTotal = calculateOurOfferTotal(testCart, 0, 0, validOriginalItemPrice);
        
        // Valider ourTotal
        if (!ourTotal || typeof ourTotal !== 'object') continue;
        const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
          ? ourTotal.sixMonth 
          : 0;
        
        const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
        const earnings = calculateTotalEarnings(testCart);
        
        // Valider beregninger
        const validSavings = Number.isFinite(savings) ? savings : -Infinity;
        const validEarnings = Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
        
        // Kun overvej hvis kunden maksimalt betaler 900 kr mere
        if (validSavings >= -MAX_ADDITIONAL_COST && validEarnings > 0) {
          const score = calculateScore(validSavings, validEarnings);
          if (Number.isFinite(score) && score > bestScoreForNoStreaming) {
            bestScoreForNoStreaming = score;
            bestPlanForNoStreaming = plan;
            bestSavingsForNoStreaming = validSavings;
            bestEarningsForNoStreaming = validEarnings;
          }
        }
      } catch (e) {
        // Skip denne plan hvis beregning fejler
        continue;
      }
    }

    if (bestPlanForNoStreaming) {
      const planName = bestPlanForNoStreaming.name || 'Ukendt plan';
      const planProvider = (bestPlanForNoStreaming.provider && typeof bestPlanForNoStreaming.provider === 'string')
        ? bestPlanForNoStreaming.provider.toUpperCase()
        : 'UKENDT';
      
      const testCart = [{ plan: bestPlanForNoStreaming, quantity: validRequiredLines, cbbMixEnabled: false, cbbMixCount: 0 }];
      const savingsText = bestSavingsForNoStreaming >= 0 
        ? `Besparelse: ${formatCurrency(bestSavingsForNoStreaming)}` 
        : `Mersalg: ${formatCurrency(Math.abs(bestSavingsForNoStreaming))}`;
      return {
        cartItems: testCart,
        explanation: `Forslag: ${planName} fra ${planProvider} (${validRequiredLines} linje${validRequiredLines > 1 ? 'r' : ''}) - ${savingsText} (Indtjening: ${formatCurrency(bestEarningsForNoStreaming)})`,
        savings: bestSavingsForNoStreaming,
        earnings: bestEarningsForNoStreaming
      };
    }
  }

  // Find voice-only planer (mobilabonnementer uden streaming)
  // Sorteret efter indtjening (højest først) - maksimer indtjening
  const voiceOnlyPlans = mobilePlans
    .filter(plan => {
      // Defensive check
      if (!plan || typeof plan !== 'object') return false;
      
      // Skal ikke have streaming slots
      if (plan.streamingCount != null && Number.isFinite(plan.streamingCount) && plan.streamingCount > 0) return false;
      // Skal ikke have specifikke streaming-tjenester
      if (Array.isArray(plan.streaming) && plan.streaming.length > 0) return false;
      // Skal ikke have CBB Mix
      if (plan.cbbMixAvailable === true) return false;
      // Alt andet er voice-only (inkl. Fri Data planer)
      return true;
    })
    .sort((a, b) => {
      try {
        // Først: Prioriter høj indtjening (maksimer indtjening)
        const earningsA = (a.earnings != null && Number.isFinite(a.earnings)) ? a.earnings : 0;
        const earningsB = (b.earnings != null && Number.isFinite(b.earnings)) ? b.earnings : 0;
        if (earningsB !== earningsA) {
          return earningsB - earningsA; // Højeste indtjening først
        }
        // Hvis samme indtjening, vælg billigste (for kundens skyld)
        const priceA = calculateSixMonthPrice(a, 1);
        const priceB = calculateSixMonthPrice(b, 1);
        const validPriceA = Number.isFinite(priceA) ? priceA : Infinity;
        const validPriceB = Number.isFinite(priceB) ? priceB : Infinity;
        return validPriceA - validPriceB;
      } catch (e) {
        return 0; // Hvis sortering fejler, behold rækkefølge
      }
    });
  

  // Find planer med streaming coverage
  const plansWithStreaming = mobilePlans.filter(plan => {
    if (!plan || typeof plan !== 'object') return false;
    return (plan.streamingCount != null && Number.isFinite(plan.streamingCount) && plan.streamingCount > 0) || 
           (Array.isArray(plan.streaming) && plan.streaming.length > 0) ||
           plan.cbbMixAvailable === true;
  });

  // Sorter streaming-planer: først præcis match, derefter tættest match, til sidst indtjening
  const sortedStreamingPlans = [...plansWithStreaming].sort((a, b) => {
    try {
      // Hent streamingCount for hver plan
      const streamingCountA = (a.streamingCount != null && Number.isFinite(a.streamingCount)) 
        ? a.streamingCount 
        : (a.cbbMixAvailable === true ? Math.min(selectedStreaming.length, 8) : 0);
      const streamingCountB = (b.streamingCount != null && Number.isFinite(b.streamingCount)) 
        ? b.streamingCount 
        : (b.cbbMixAvailable === true ? Math.min(selectedStreaming.length, 8) : 0);
      
      const selectedCount = selectedStreaming.length;
      
      // Prioritering 1: Præcis match (streamingCount === selectedCount)
      const isExactMatchA = streamingCountA === selectedCount;
      const isExactMatchB = streamingCountB === selectedCount;
      
      if (isExactMatchA && !isExactMatchB) {
        return -1; // A er præcis match, B er ikke
      }
      if (!isExactMatchA && isExactMatchB) {
        return 1; // B er præcis match, A er ikke
      }
      
      // Prioritering 2: Planer med streamingCount <= selectedCount prioriteres over dem med streamingCount > selectedCount
      const isWithinLimitA = streamingCountA <= selectedCount;
      const isWithinLimitB = streamingCountB <= selectedCount;
      
      if (isWithinLimitA && !isWithinLimitB) {
        return -1; // A er inden for grænsen, B er over
      }
      if (!isWithinLimitA && isWithinLimitB) {
        return 1; // B er inden for grænsen, A er over
      }
      
      // Prioritering 3: Tættest match (streamingCount tættest på selectedCount)
      // Hvis begge er inden for grænsen eller begge er over, prioriter tættest match
      if (!isExactMatchA && !isExactMatchB) {
        // For planer inden for grænsen: mindre afstand er bedre
        // For planer over grænsen: mindre overskridelse er bedre
        if (isWithinLimitA && isWithinLimitB) {
          // Begge er inden for grænsen - tættest på selectedCount er bedst
          const distanceA = selectedCount - streamingCountA;
          const distanceB = selectedCount - streamingCountB;
          if (distanceA !== distanceB) {
            return distanceA - distanceB; // Mindre afstand er bedre
          }
        } else {
          // Begge er over grænsen - mindre overskridelse er bedre
          const overshootA = streamingCountA - selectedCount;
          const overshootB = streamingCountB - selectedCount;
          if (overshootA !== overshootB) {
            return overshootA - overshootB; // Mindre overskridelse er bedre
          }
        }
      }
      
      // Prioritering 4: Indtjening (højest først)
      const earningsA = (a.earnings != null && Number.isFinite(a.earnings)) ? a.earnings : 0;
      const earningsB = (b.earnings != null && Number.isFinite(b.earnings)) ? b.earnings : 0;
      if (earningsB !== earningsA) {
        return earningsB - earningsA; // Højeste indtjening først
      }
      
      // Prioritering 5: Hvis samme indtjening, vælg billigste
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      const validPriceA = Number.isFinite(priceA) ? priceA : Infinity;
      const validPriceB = Number.isFinite(priceB) ? priceB : Infinity;
      return validPriceA - validPriceB;
    } catch (e) {
      return 0; // Hvis sortering fejler, behold rækkefølge
    }
  });


  // Strategi 1: En plan med streaming + voice-only planer til resten
  if (selectedStreaming.length > 0 && sortedStreamingPlans.length > 0 && voiceOnlyPlans.length > 0) {
    for (const streamingPlan of sortedStreamingPlans.slice(0, 5)) {
      // Defensive check
      if (!streamingPlan || typeof streamingPlan !== 'object') continue;
      
      let streamingLinesNeeded = 1;
      let streamingSlotsAvailable = 0;
      
      try {
        // Beregn hvor mange linjer der skal bruges til streaming
        const streamingCount = (streamingPlan.streamingCount != null && Number.isFinite(streamingPlan.streamingCount))
          ? streamingPlan.streamingCount 
          : 0;
        
        if (streamingCount > 0) {
          streamingSlotsAvailable = streamingCount;
          streamingLinesNeeded = Math.ceil(selectedStreaming.length / streamingSlotsAvailable);
          // Valider at streamingLinesNeeded er et gyldigt tal
          if (!Number.isFinite(streamingLinesNeeded) || streamingLinesNeeded < 1) {
            streamingLinesNeeded = 1;
          }
        } else if (streamingPlan.cbbMixAvailable === true) {
          // CBB Mix kan dække op til 8 tjenester på 1 linje
          streamingLinesNeeded = 1;
          streamingSlotsAvailable = Math.min(selectedStreaming.length, 8);
        } else {
          continue; // Skip planer uden streaming slots
        }
        
        // Hvis vi har flere linjer end nødvendigt til streaming, brug voice-only til resten
        const remainingLines = validRequiredLines - streamingLinesNeeded;
        
        if (remainingLines >= 0 && streamingLinesNeeded <= validMaxLines) {
          // Filtrer voice-only planer til kun at inkludere dem fra samme operatør som streaming-planen
          // Dette sikrer at vi kun kombinerer planer fra samme operatør
          const streamingProvider = (streamingPlan.provider && typeof streamingPlan.provider === 'string')
            ? streamingPlan.provider 
            : '';
          
          const voicePlansFromSameProvider = voiceOnlyPlans.filter(plan => {
            if (!plan || typeof plan !== 'object') return false;
            const planProvider = (plan.provider && typeof plan.provider === 'string') ? plan.provider : '';
            return planProvider === streamingProvider;
          });
          
          // Prøv forskellige voice-only planer for at finde den bedste kombination
          // Test de første 5 voice-only planer fra samme operatør (sorteret efter indtjening)
          const voicePlansToTest = voicePlansFromSameProvider.slice(0, 5);
          
          for (const voicePlan of voicePlansToTest) {
            // Defensive check
            if (!voicePlan || typeof voicePlan !== 'object') continue;
            
            try {
              const testCart = [];
              
              // Tilføj streaming plan
              if (streamingPlan.cbbMixAvailable === true) {
                const cbbMixCount = Math.min(selectedStreaming.length, 8);
                testCart.push({
                  plan: streamingPlan,
                  quantity: streamingLinesNeeded,
                  cbbMixEnabled: true,
                  cbbMixCount: Number.isFinite(cbbMixCount) ? cbbMixCount : 2
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
              
              // Valider at alle planer kommer fra samme operatør
              if (!hasSameProvider(testCart)) {
                continue; // Skip hvis ikke samme operatør
              }
              
              const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
              
              // Sikre array operation for notIncluded
              let notIncludedCost = 0;
              if (Array.isArray(coverage.notIncluded) && coverage.notIncluded.length > 0) {
                try {
                  notIncludedCost = coverage.notIncluded.reduce((sum, id) => {
                    if (id == null) return sum;
                    const price = getPrice(id);
                    const validPrice = Number.isFinite(price) && price >= 0 ? price : 0;
                    const newSum = sum + validPrice;
                    return Number.isFinite(newSum) ? newSum : sum;
                  }, 0);
                  if (!Number.isFinite(notIncludedCost) || notIncludedCost < 0) {
                    notIncludedCost = 0;
                  }
                } catch (e) {
                  notIncludedCost = 0;
                }
              }
              
              const ourTotal = calculateOurOfferTotal(testCart, notIncludedCost, 0, validOriginalItemPrice);
              
              // Valider ourTotal
              if (!ourTotal || typeof ourTotal !== 'object') continue;
              const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
                ? ourTotal.sixMonth 
                : 0;
              
              const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
              const earnings = calculateTotalEarnings(testCart);
              
              // Valider beregninger
              const validSavings = Number.isFinite(savings) ? savings : -Infinity;
              const validEarnings = Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
              
              // Tjek om streaming plan har præcis match med antal valgte streaming-tjenester
              const streamingCount = (streamingPlan.streamingCount != null && Number.isFinite(streamingPlan.streamingCount))
                ? streamingPlan.streamingCount 
                : (streamingPlan.cbbMixAvailable === true ? Math.min(selectedStreaming.length, 8) : 0);
              const isExactStreamingMatch = streamingCount === selectedStreaming.length;
              
              // Beregn score med bonus for præcis match
              let score = calculateScore(validSavings, validEarnings);
              if (isExactStreamingMatch && Number.isFinite(score)) {
                // Tilføj stor bonus for præcis match (svarer til 5000 kr ekstra indtjening)
                score += 50000;
              }

              const streamingPlanName = streamingPlan.name || 'Ukendt plan';
              const voicePlanName = voicePlan.name || 'Ukendt plan';
              
              const streamingPart = streamingPlan.cbbMixAvailable === true
                ? `${streamingPlanName} med CBB MIX (${Math.min(selectedStreaming.length, 8)} tjenester)`
                : `${streamingPlanName} (${streamingLinesNeeded}x)`;
              const voicePart = remainingLines > 0 ? ` + ${voicePlanName} (${remainingLines}x)` : '';
              const reason = `${streamingPart}${voicePart}`;

              // Opdater hvis bedre score (prioriter indtjening)
              // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
              // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
              
              if (Number.isFinite(score) && score > bestScore && validSavings >= -MAX_ADDITIONAL_COST && validSavings >= validMinSavings && validEarnings > 0) {
                bestSavings = validSavings;
                bestEarnings = validEarnings;
                bestScore = score; // Opdater bedste score inkl. bonus
                
                // Forbedret deep copy med error handling
                try {
                  bestSolution = JSON.parse(JSON.stringify(testCart));
                  // Valider at deep copy virkede
                  if (!Array.isArray(bestSolution)) {
                    bestSolution = testCart.map(item => ({ ...item }));
                  }
                } catch (e) {
                  // Hvis JSON deep copy fejler, brug shallow copy
                  bestSolution = testCart.map(item => ({ ...item }));
                }
                
                const savingsText = validSavings >= 0 
                  ? `Besparelse: ${formatCurrency(validSavings)}` 
                  : `Mersalg: ${formatCurrency(Math.abs(validSavings))}`;
                const includedCount = Array.isArray(coverage.included) ? coverage.included.length : 0;
                bestExplanation = `${reason} - Dækker ${includedCount}/${selectedStreaming.length} streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(validEarnings)})`;
              }
            } catch (e) {
              // Skip denne kombination hvis beregning fejler
              continue;
            }
          }
        }
      } catch (e) {
        // Skip denne plan hvis beregning fejler
        continue;
      }
    }
  }

  // Strategi 2: Hvis ingen streaming-tjenester, brug kun billigste voice-only planer
  if (selectedStreaming.length === 0 && voiceOnlyPlans.length > 0) {
    try {
      const cheapestPlan = voiceOnlyPlans[0];
      
      // Defensive check
      if (!cheapestPlan || typeof cheapestPlan !== 'object') {
        // Skip hvis plan er ugyldig
      } else {
        const testCart = [{
          plan: cheapestPlan,
          quantity: validRequiredLines,
          cbbMixEnabled: false,
          cbbMixCount: 0
        }];
        
        const ourTotal = calculateOurOfferTotal(testCart, 0, 0, validOriginalItemPrice);
        
        // Valider ourTotal
        if (ourTotal && typeof ourTotal === 'object') {
          const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
            ? ourTotal.sixMonth 
            : 0;
          
          const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
          const earnings = calculateTotalEarnings(testCart);
          
          // Valider beregninger
          const validSavings = Number.isFinite(savings) ? savings : -Infinity;
          const validEarnings = Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
          
          const score = calculateScore(validSavings, validEarnings);

          // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
          // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
          if (Number.isFinite(score) && score > bestScore && validSavings >= -MAX_ADDITIONAL_COST && validSavings >= validMinSavings && validEarnings > 0) {
            bestSavings = validSavings;
            bestEarnings = validEarnings;
            bestScore = score; // Opdater bedste score
            
            // Forbedret deep copy
            try {
              bestSolution = JSON.parse(JSON.stringify(testCart));
              if (!Array.isArray(bestSolution)) {
                bestSolution = testCart.map(item => ({ ...item }));
              }
            } catch (e) {
              bestSolution = testCart.map(item => ({ ...item }));
            }
            
            const planName = cheapestPlan.name || 'Ukendt plan';
            const savingsText = validSavings >= 0 
              ? `Besparelse: ${formatCurrency(validSavings)}` 
              : `Mersalg: ${formatCurrency(Math.abs(validSavings))}`;
            bestExplanation = `${planName} (${validRequiredLines}x) - Ingen streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(validEarnings)})`;
          }
        }
      }
    } catch (e) {
      // Skip hvis beregning fejler
    }
  }

  // Strategi 3: Fallback - hvis ingen voice-only planer, brug billigste planer generelt
  if (!bestSolution && mobilePlans.length > 0) {
    try {
      const sortedPlans = [...mobilePlans].sort((a, b) => {
        try {
          const priceA = calculateSixMonthPrice(a, 1);
          const priceB = calculateSixMonthPrice(b, 1);
          const validPriceA = Number.isFinite(priceA) ? priceA : Infinity;
          const validPriceB = Number.isFinite(priceB) ? priceB : Infinity;
          return validPriceA - validPriceB;
        } catch (e) {
          return 0;
        }
      });
      
      // Prøv forskellige kombinationer af billige planer
      for (let i = 0; i < Math.min(sortedPlans.length, 3); i++) {
        const plan = sortedPlans[i];
        
        // Defensive check
        if (!plan || typeof plan !== 'object') continue;
        
        try {
          const testCart = [{
            plan,
            quantity: validRequiredLines,
            cbbMixEnabled: false,
            cbbMixCount: 0
          }];
          
          const coverage = checkStreamingCoverageWithCBBMix(testCart, selectedStreaming);
          
          // Sikre array operation for notIncluded
          let notIncludedCost = 0;
          if (Array.isArray(coverage.notIncluded) && coverage.notIncluded.length > 0) {
            try {
              notIncludedCost = coverage.notIncluded.reduce((sum, id) => {
                if (id == null) return sum;
                const price = getPrice(id);
                const validPrice = Number.isFinite(price) && price >= 0 ? price : 0;
                const newSum = sum + validPrice;
                return Number.isFinite(newSum) ? newSum : sum;
              }, 0);
              if (!Number.isFinite(notIncludedCost) || notIncludedCost < 0) {
                notIncludedCost = 0;
              }
            } catch (e) {
              notIncludedCost = 0;
            }
          }
          
          const ourTotal = calculateOurOfferTotal(testCart, notIncludedCost, 0, validOriginalItemPrice);
          
          // Valider ourTotal
          if (!ourTotal || typeof ourTotal !== 'object') continue;
          const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
            ? ourTotal.sixMonth 
            : 0;
          
          const savings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
          const earnings = calculateTotalEarnings(testCart);
          
          // Valider beregninger
          const validSavings = Number.isFinite(savings) ? savings : -Infinity;
          const validEarnings = Number.isFinite(earnings) && earnings > 0 ? earnings : 0;
          
          const score = calculateScore(validSavings, validEarnings);

          // KRITISK: Kunden må maksimalt betale 900 kr mere (savings >= -900)
          // KRITISK: Total indtjening skal ALTID være positiv (vi skal tjene penge)
          if (Number.isFinite(score) && score > bestScore && validSavings >= -MAX_ADDITIONAL_COST && validSavings >= validMinSavings && validEarnings > 0) {
            bestSavings = validSavings;
            bestEarnings = validEarnings;
            bestScore = score; // Opdater bedste score
            
            // Forbedret deep copy
            try {
              bestSolution = JSON.parse(JSON.stringify(testCart));
              if (!Array.isArray(bestSolution)) {
                bestSolution = testCart.map(item => ({ ...item }));
              }
            } catch (e) {
              bestSolution = testCart.map(item => ({ ...item }));
            }
            
            const planName = plan.name || 'Ukendt plan';
            const savingsText = validSavings >= 0 
              ? `Besparelse: ${formatCurrency(validSavings)}` 
              : `Mersalg: ${formatCurrency(Math.abs(validSavings))}`;
            const includedCount = Array.isArray(coverage.included) ? coverage.included.length : 0;
            bestExplanation = `${planName} (${validRequiredLines}x) - Dækker ${includedCount}/${selectedStreaming.length} streaming-tjenester (${savingsText}, Indtjening: ${formatCurrency(validEarnings)})`;
          }
        } catch (e) {
          // Skip denne plan hvis beregning fejler
          continue;
        }
      }
    } catch (e) {
      // Skip hvis sortering fejler
    }
  }

  // Hvis ingen god løsning fundet, prøv at finde planer med høj indtjening
  // Sorter efter indtjening (højest først) for at maksimere indtjening
  if (!bestSolution || (!Number.isFinite(bestSavings) || bestSavings < -MAX_ADDITIONAL_COST)) {
    try {
      // Sorter planer efter indtjening (højest først) for at maksimere indtjening
      const sortedPlans = [...mobilePlans].sort((a, b) => {
        try {
          const earningsA = (a.earnings != null && Number.isFinite(a.earnings)) ? a.earnings : 0;
          const earningsB = (b.earnings != null && Number.isFinite(b.earnings)) ? b.earnings : 0;
          if (earningsB !== earningsA) {
            return earningsB - earningsA; // Højeste indtjening først
          }
          // Hvis samme indtjening, vælg billigste
          const priceA = calculateSixMonthPrice(a, 1);
          const priceB = calculateSixMonthPrice(b, 1);
          const validPriceA = Number.isFinite(priceA) ? priceA : Infinity;
          const validPriceB = Number.isFinite(priceB) ? priceB : Infinity;
          return validPriceA - validPriceB;
        } catch (e) {
          return 0;
        }
      });
      
      // Prøv planer med høj indtjening indtil vi finder en der er acceptabel
      for (const plan of sortedPlans.slice(0, 10)) {
        // Defensive check
        if (!plan || typeof plan !== 'object') continue;
        
        try {
          const testCart = [{
            plan,
            quantity: validRequiredLines,
            cbbMixEnabled: false,
            cbbMixCount: 0
          }];
          
          const ourTotal = calculateOurOfferTotal(testCart, streamingCost, 0, validOriginalItemPrice);
          
          // Valider ourTotal
          if (!ourTotal || typeof ourTotal !== 'object') continue;
          const validOurSixMonth = Number.isFinite(ourTotal.sixMonth) && ourTotal.sixMonth >= 0
            ? ourTotal.sixMonth 
            : 0;
          
          const testSavings = calculateSavings(validCustomerSixMonth, validOurSixMonth);
          const testEarnings = calculateTotalEarnings(testCart);
          
          // Valider beregninger
          const validTestSavings = Number.isFinite(testSavings) ? testSavings : -Infinity;
          const validTestEarnings = Number.isFinite(testEarnings) && testEarnings > 0 ? testEarnings : 0;
          
          const testScore = calculateScore(validTestSavings, validTestEarnings);
          
          // Accepter hvis kunden maksimalt betaler 900 kr mere OG indtjening er positiv
          if (validTestSavings >= -MAX_ADDITIONAL_COST && validTestEarnings > 0) {
            if (Number.isFinite(testScore) && testScore > bestScore) {
              bestSolution = testCart.map(item => ({ ...item })); // Shallow copy
              bestSavings = validTestSavings;
              bestEarnings = validTestEarnings;
              bestScore = testScore; // Opdater bedste score
              const planName = plan.name || 'Ukendt plan';
              const savingsText = validTestSavings >= 0 
                ? `Besparelse: ${formatCurrency(validTestSavings)}` 
                : `Mersalg: ${formatCurrency(Math.abs(validTestSavings))}`;
              bestExplanation = `Forslag: ${planName} (${validRequiredLines}x) - ${savingsText} (Indtjening: ${formatCurrency(validTestEarnings)})`;
            }
          }
        } catch (e) {
          // Skip denne plan hvis beregning fejler
          continue;
        }
      }
    } catch (e) {
      // Skip hvis sortering fejler
    }
    
    // Hvis stadig ingen løsning, returner tom array
    const validBestSavings = Number.isFinite(bestSavings) ? bestSavings : -Infinity;
    const validBestEarnings = Number.isFinite(bestEarnings) ? bestEarnings : 0;
    
    if (!bestSolution || validBestSavings < -MAX_ADDITIONAL_COST || validBestEarnings <= 0) {
      return {
        cartItems: [],
        explanation: `Kunne ikke finde en løsning hvor kunden maksimalt betaler ${formatCurrency(MAX_ADDITIONAL_COST)} mere og der er positiv indtjening`,
        savings: 0,
        earnings: 0
      };
    }
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

