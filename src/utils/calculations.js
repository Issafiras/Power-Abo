/**
 * Beregningslogik for mobilabonnementer og streaming
 * Håndterer intro-priser, familie-rabatter, og totaler
 */

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
  cartItems.forEach(item => {
    if (item.plan.streaming && item.plan.streaming.length > 0) {
      item.plan.streaming.forEach(service => includedStreaming.add(service));
    }
  });

  // Split valgte streaming i inkluderet og ikke-inkluderet
  const included = selectedStreaming.filter(id => includedStreaming.has(id));
  const notIncluded = selectedStreaming.filter(id => !includedStreaming.has(id));

  return { included, notIncluded };
}

/**
 * Beregn kunde totaler
 * @param {number} currentMobileCost - Nuværende mobiludgifter pr. måned
 * @param {number} streamingCost - Total streaming-udgifter pr. måned
 * @returns {Object} { monthly: number, sixMonth: number }
 */
export function calculateCustomerTotal(currentMobileCost, streamingCost) {
  const monthly = (currentMobileCost || 0) + (streamingCost || 0);
  return {
    monthly,
    sixMonth: monthly * 6
  };
}

/**
 * Beregn vores tilbud total
 * @param {Array} cartItems - Array af kurv-items
 * @param {number} streamingCost - Ikke-inkluderet streaming-omkostning
 * @param {number} cashDiscount - Kontant rabat (valgfri)
 * @returns {Object} { monthly: number, sixMonth: number, telenorDiscount: number }
 */
export function calculateOurOfferTotal(cartItems, streamingCost = 0, cashDiscount = 0) {
  if (!cartItems || cartItems.length === 0) {
    return { monthly: 0, sixMonth: 0, telenorDiscount: 0 };
  }

  // Beregn 6-måneders total for alle planer
  const plansSixMonth = cartItems.reduce((total, item) => {
    return total + calculateSixMonthPrice(item.plan, item.quantity);
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

  // Træk kontant rabat
  const sixMonth = beforeCashDiscount - (cashDiscount || 0);

  return {
    monthly: sixMonth / 6,
    sixMonth: Math.max(0, sixMonth), // Må ikke være negativ
    telenorDiscount
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

