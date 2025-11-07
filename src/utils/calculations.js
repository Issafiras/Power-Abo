/**
 * Beregningslogik for mobilabonnementer og streaming
 * Håndterer intro-priser, familie-rabatter, og totaler
 */


// Konstanter
export const SETUP_FEE_PER_LINE = 99; // Oprettelsesgebyr per mobilabonnement

/**
 * Beregn 6-måneders pris for en plan med intro-pris håndtering
 * @param {Object} plan - Plan objekt
 * @param {number} quantity - Antal linjer
 * @returns {number} Total 6-måneders pris
 */
export function calculateSixMonthPrice(plan, quantity = 1) {
  if (!plan) return 0;

  // Hvis der er intro-pris
  if (plan.introPrice && plan.introMonths) {
    const introTotal = plan.introPrice * plan.introMonths * quantity;
    const remainingMonths = 6 - plan.introMonths;
    const normalTotal = plan.price * remainingMonths * quantity;
    return introTotal + normalTotal;
  }

  // Normal pris
  return plan.price * 6 * quantity;
}

/**
 * Beregn månedlig pris for en plan (gennemsnit over 6 måneder hvis intro-pris)
 * @param {Object} plan - Plan objekt
 * @param {number} quantity - Antal linjer
 * @returns {number} Gennemsnitlig månedlig pris
 */
export function calculateMonthlyPrice(plan, quantity = 1) {
  if (!plan) return 0;

  if (plan.introPrice && plan.introMonths) {
    const sixMonthTotal = calculateSixMonthPrice(plan, quantity);
    return sixMonthTotal / 6;
  }

  return plan.price * quantity;
}

/**
 * Beregn Telenor familie-rabat
 * @param {Array} cartItems - Array af kurv-items
 * @returns {number} Total månedlig rabat
 */
export function calculateTelenorFamilyDiscount(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  // Tæl antal Telenor-linjer
  const telenorLines = cartItems
    .filter(item => item.plan.provider === 'telenor' && item.plan.familyDiscount)
    .reduce((total, item) => total + item.quantity, 0);

  // Rabat = (antal_linjer - 1) × 50 kr/md
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

  // Debug log
  console.log('🔍 Debug checkStreamingCoverage:');
  console.log('Selected streaming:', selectedStreaming);
  console.log('Included streaming from plans:', Array.from(includedStreaming));
  console.log('Total streaming slots available:', totalStreamingSlots);
  console.log('Cart items:', cartItems.map(item => ({ 
    name: item.plan.name, 
    streaming: item.plan.streaming,
    streamingCount: item.plan.streamingCount,
    quantity: item.quantity
  })));

  // Hvis der er streaming slots tilgængelige (mix-system)
  if (totalStreamingSlots > 0) {
    // Tag de første N streaming-tjenester (hvor N = totalStreamingSlots)
    const included = selectedStreaming.slice(0, totalStreamingSlots);
    const notIncluded = selectedStreaming.slice(totalStreamingSlots);
    
    console.log('Mix system - Included:', included);
    console.log('Mix system - Not included:', notIncluded);
    
    return { included, notIncluded };
  }

  // Ellers brug den gamle logik (specifikke streaming-tjenester)
  const included = selectedStreaming.filter(id => includedStreaming.has(id));
  const notIncluded = selectedStreaming.filter(id => !includedStreaming.has(id));

  console.log('Specific streaming - Included:', included);
  console.log('Specific streaming - Not included:', notIncluded);

  return { included, notIncluded };
}

/**
 * Beregn kunde totaler
 * @param {number} currentMobileCost - Nuværende mobiludgifter pr. måned
 * @param {number} streamingCost - Total streaming-udgifter pr. måned
 * @param {number} originalItemPrice - Varens pris inden rabat (engangspris)
 * @returns {Object} { monthly: number, sixMonth: number }
 */
export function calculateCustomerTotal(currentMobileCost, streamingCost, originalItemPrice = 0) {
  const monthly = (currentMobileCost || 0) + (streamingCost || 0);
  return {
    monthly,
    sixMonth: (monthly * 6) + (originalItemPrice || 0)
  };
}

/**
 * Beregn vores tilbud total
 * @param {Array} cartItems - Array af kurv-items
 * @param {number} streamingCost - Ikke-inkluderet streaming-omkostning
 * @param {number} cashDiscount - Kontant rabat (valgfri)
 * @param {number} originalItemPrice - Varens pris inden rabat (engangspris)
 * @returns {Object} { monthly: number, sixMonth: number, telenorDiscount: number }
 */
export function calculateOurOfferTotal(cartItems, streamingCost = 0, cashDiscount = 0, originalItemPrice = 0) {
  if (!cartItems || cartItems.length === 0) {
    return { monthly: 0, sixMonth: 0, telenorDiscount: 0, setupFee: 0 };
  }

  // Beregn totalt antal mobilabonnementer
  const totalLines = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Beregn oprettelsesgebyr
  const setupFee = totalLines * SETUP_FEE_PER_LINE;

  // Beregn 6-måneders total for alle planer (inkl. CBB Mix)
  const plansSixMonth = cartItems.reduce((total, item) => {
    let itemTotal = calculateSixMonthPrice(item.plan, item.quantity);
    
    // Tilføj CBB Mix pris hvis aktiv
    if (item.plan.cbbMixAvailable && item.cbbMixEnabled && item.cbbMixCount) {
      const mixPrice = calculateCBBMixPrice(item.plan, item.cbbMixCount);
      itemTotal += mixPrice * 6 * item.quantity; // 6 måneder
    }
    
    return total + itemTotal;
  }, 0);

  // Beregn Telenor familie-rabat
  const telenorDiscount = calculateTelenorFamilyDiscount(cartItems);
  const telenorDiscountSixMonth = telenorDiscount * 6;

  // Total efter familie-rabat
  const afterFamilyDiscount = plansSixMonth - telenorDiscountSixMonth;

  // Tilføj ikke-inkluderet streaming
  const streamingSixMonth = streamingCost * 6;

  // Total før kontant rabat
  const beforeCashDiscount = afterFamilyDiscount + streamingSixMonth;

  // Træk kontant rabat (kun hvis aktiv)
  const afterCashDiscount = beforeCashDiscount - (cashDiscount || 0);
  
  // Tilføj varens pris og oprettelsesgebyr (engangsbetalinger)
  const sixMonth = afterCashDiscount + (originalItemPrice || 0) + setupFee;

  return {
    monthly: afterCashDiscount / 6, // Monthly beregnes uden engangsbetalinger
    sixMonth: Math.max(0, sixMonth), // Må ikke være negativ
    telenorDiscount,
    setupFee
  };
}

/**
 * Beregn besparelse
 * @param {number} customerTotal - Kunde 6-måneders total
 * @param {number} ourTotal - Vores 6-måneders total
 * @returns {number} Besparelse (positiv = godt, negativ = tab)
 */
export function calculateSavings(customerTotal, ourTotal) {
  return customerTotal - ourTotal;
}

/**
 * Auto-justér kontant rabat for minimum besparelse
 * @param {number} customerTotal - Kunde 6-måneders total
 * @param {number} ourTotalBeforeDiscount - Vores total før kontant rabat
 * @param {number} minimumSavings - Minimum ønsket besparelse (standard: 500)
 * @returns {number} Nødvendig kontant rabat
 */
export function autoAdjustCashDiscount(customerTotal, ourTotalBeforeDiscount, minimumSavings = 500) {
  const currentSavings = customerTotal - ourTotalBeforeDiscount;
  
  if (currentSavings >= minimumSavings) {
    return 0; // Ingen rabat nødvendig
  }

  // Beregn nødvendig rabat for at nå minimum besparelse
  const neededDiscount = minimumSavings - currentSavings;
  return Math.max(0, Math.ceil(neededDiscount / 100) * 100); // Rund op til nærmeste 100
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
  
  // Funktion til at beregne score baseret på indtjening og besparelse
  const calculateScore = (savings, earnings) => {
    // KRITISK: Besparelse skal ALTID være positiv (kunden må ikke betale mere)
    if (savings < 0) {
      return -Infinity; // Diskvalificer løsninger der er dyrere
    }
    // Prioriter indtjening højere end besparelse, men kun hvis besparelse er positiv
    // Score = indtjening * 2 + besparelse
    return (earnings * 2) + savings;
  };

  // Hvis ingen streaming-tjenester, find billigste plan der matcher mobiludgifter
  if (selectedStreaming.length === 0) {
    const sortedPlans = [...mobilePlans].sort((a, b) => {
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      return priceA - priceB;
    });

    const bestPlan = sortedPlans[0];
    const testCart = [{ plan: bestPlan, quantity: requiredLines, cbbMixEnabled: false, cbbMixCount: 0 }];
    const ourTotal = calculateOurOfferTotal(testCart, 0, 0, originalItemPrice);
    const savings = calculateSavings(customerTotal.sixMonth, ourTotal.sixMonth);
    const earnings = calculateTotalEarnings(testCart);

    return {
      cartItems: testCart,
      explanation: `Forslag: ${bestPlan.name} fra ${bestPlan.provider.toUpperCase()} (${requiredLines} linje${requiredLines > 1 ? 'r' : ''}) - ${savings >= 0 ? 'Besparelse' : 'Mersalg'}: ${formatCurrency(Math.abs(savings))} (Indtjening: ${formatCurrency(earnings)})`,
      savings,
      earnings
    };
  }

  // Find voice-only planer (mobilabonnementer uden streaming)
  // Sorteret efter pris (billigste først), derefter indtjening (højest først)
  // Dette sikrer at vi finder billige planer først, men stadig prioriterer høj indtjening
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
      // Først: Sorter efter pris (billigste først) - dette sikrer vi finder billige løsninger
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      if (Math.abs(priceA - priceB) > 100) {
        // Hvis prisforskel er mere end 100 kr, prioriter billigste
        return priceA - priceB;
      }
      // Hvis priser er tæt på hinanden, prioriter høj indtjening
      const earningsA = a.earnings || 0;
      const earningsB = b.earnings || 0;
      return earningsB - earningsA; // Højeste indtjening først
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
    for (const streamingPlan of sortedStreamingPlans.slice(0, 10)) {
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
          // KRITISK: Besparelse skal ALTID være >= 0 (kunden må ikke betale mere)
          const currentBestScore = bestSolution ? calculateScore(bestSavings, bestEarnings) : -Infinity;
          
          if (score > currentBestScore && savings >= 0 && savings >= minSavings) {
            bestSavings = savings;
            bestEarnings = earnings;
            bestSolution = JSON.parse(JSON.stringify(testCart)); // Deep copy
            bestExplanation = `${reason} - Dækker ${coverage.included.length}/${selectedStreaming.length} streaming-tjenester (Indtjening: ${formatCurrency(earnings)})`;
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
    
    // KRITISK: Besparelse skal ALTID være >= 0 (kunden må ikke betale mere)
    if (score > currentBestScore && savings >= 0 && savings >= minSavings) {
      bestSavings = savings;
      bestEarnings = earnings;
      bestSolution = JSON.parse(JSON.stringify(testCart));
      bestExplanation = `${cheapestPlan.name} (${requiredLines}x) - Ingen streaming-tjenester (Indtjening: ${formatCurrency(earnings)})`;
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
      
      // KRITISK: Besparelse skal ALTID være >= 0 (kunden må ikke betale mere)
      if (score > currentBestScore && savings >= 0 && savings >= minSavings) {
        bestSavings = savings;
        bestEarnings = earnings;
        bestSolution = JSON.parse(JSON.stringify(testCart));
        bestExplanation = `${plan.name} (${requiredLines}x) - Dækker ${coverage.included.length}/${selectedStreaming.length} streaming-tjenester (Indtjening: ${formatCurrency(earnings)})`;
      }
    }
  }

  // Hvis ingen god løsning fundet (med positiv besparelse), prøv at finde billigste planer
  // Men kun hvis de giver positiv besparelse
  if (!bestSolution || bestSavings < 0) {
    // Sorter planer efter pris (billigste først) og prøv dem indtil vi finder en med positiv besparelse
    const sortedPlans = [...mobilePlans].sort((a, b) => {
      const priceA = calculateSixMonthPrice(a, 1);
      const priceB = calculateSixMonthPrice(b, 1);
      return priceA - priceB;
    });
    
    // Prøv de billigste planer indtil vi finder en med positiv besparelse
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
      
      // Kun accepter hvis besparelse er positiv
      if (testSavings >= 0) {
        bestSolution = testCart;
        bestSavings = testSavings;
        bestEarnings = testEarnings;
        bestExplanation = `Forslag: ${plan.name} (${requiredLines}x) - Besparelse: ${formatCurrency(testSavings)} (Indtjening: ${formatCurrency(testEarnings)})`;
        break; // Stop ved første løsning med positiv besparelse
      }
    }
    
    // Hvis stadig ingen løsning, returner tom array
    if (!bestSolution || bestSavings < 0) {
      return {
        cartItems: [],
        explanation: 'Kunne ikke finde en løsning der er billigere end kundens nuværende udgifter',
        savings: 0,
        earnings: 0
      };
    }
  }

  return {
    cartItems: bestSolution || [],
    explanation: bestExplanation || 'Ingen løsning fundet',
    savings: bestSavings || 0,
    earnings: bestEarnings || 0
  };
}

