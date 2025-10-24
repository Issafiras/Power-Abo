/**
 * LocalStorage utility funktioner
 * Håndterer persistens af kurv, priser, og indstillinger
 */

const STORAGE_KEYS = {
  CART: 'power_calculator_cart',
  STREAMING: 'power_calculator_streaming',
  CUSTOMER_MOBILE_COST: 'power_calculator_mobile_cost',
  ORIGINAL_ITEM_PRICE: 'power_calculator_original_item_price',
  CASH_DISCOUNT: 'power_calculator_cash_discount',
  CASH_DISCOUNT_LOCKED: 'power_calculator_cash_discount_locked',
  AUTO_ADJUST: 'power_calculator_auto_adjust',
  THEME: 'power_calculator_theme',
  SHOW_CASH_DISCOUNT: 'power_calculator_show_cash_discount'
};

/**
 * Gem data i localStorage
 * @param {string} key - Storage key
 * @param {any} value - Værdi at gemme
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Fejl ved lagring:', error);
  }
}

/**
 * Hent data fra localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Standard værdi hvis ikke fundet
 * @returns {any} Gemt værdi eller default
 */
function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Fejl ved hentning:', error);
    return defaultValue;
  }
}

/**
 * Fjern data fra localStorage
 * @param {string} key - Storage key
 */
function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Fejl ved sletning:', error);
  }
}

// Kurv funktioner
export function saveCart(cartItems) {
  setItem(STORAGE_KEYS.CART, cartItems);
}

export function loadCart() {
  return getItem(STORAGE_KEYS.CART, []);
}

export function clearCart() {
  removeItem(STORAGE_KEYS.CART);
}

// Streaming funktioner
export function saveSelectedStreaming(streamingIds) {
  setItem(STORAGE_KEYS.STREAMING, streamingIds);
}

export function loadSelectedStreaming() {
  return getItem(STORAGE_KEYS.STREAMING, []);
}

export function clearSelectedStreaming() {
  removeItem(STORAGE_KEYS.STREAMING);
}

// Kunde mobiludgifter
export function saveCustomerMobileCost(cost) {
  setItem(STORAGE_KEYS.CUSTOMER_MOBILE_COST, cost);
}

export function loadCustomerMobileCost() {
  return getItem(STORAGE_KEYS.CUSTOMER_MOBILE_COST, 0);
}

// Varens pris inden rabat
export function saveOriginalItemPrice(price) {
  setItem(STORAGE_KEYS.ORIGINAL_ITEM_PRICE, price);
}

export function loadOriginalItemPrice() {
  return getItem(STORAGE_KEYS.ORIGINAL_ITEM_PRICE, 0);
}

// Kontant rabat funktioner
export function saveCashDiscount(amount) {
  setItem(STORAGE_KEYS.CASH_DISCOUNT, amount);
}

export function loadCashDiscount() {
  return getItem(STORAGE_KEYS.CASH_DISCOUNT, null);
}

export function saveCashDiscountLocked(locked) {
  setItem(STORAGE_KEYS.CASH_DISCOUNT_LOCKED, locked);
}

export function loadCashDiscountLocked() {
  return getItem(STORAGE_KEYS.CASH_DISCOUNT_LOCKED, false);
}

export function saveAutoAdjust(enabled) {
  setItem(STORAGE_KEYS.AUTO_ADJUST, enabled);
}

export function loadAutoAdjust() {
  return getItem(STORAGE_KEYS.AUTO_ADJUST, false);
}

export function saveShowCashDiscount(show) {
  setItem(STORAGE_KEYS.SHOW_CASH_DISCOUNT, show);
}

export function loadShowCashDiscount() {
  return getItem(STORAGE_KEYS.SHOW_CASH_DISCOUNT, false);
}

// Tema funktioner
export function saveTheme(theme) {
  setItem(STORAGE_KEYS.THEME, theme);
}

export function loadTheme() {
  return getItem(STORAGE_KEYS.THEME, 'dark');
}

// Reset alt
export function resetAll() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
}

// Eksportér storage state
export function exportState() {
  return {
    cart: loadCart(),
    streaming: loadSelectedStreaming(),
    mobileCost: loadCustomerMobileCost(),
    originalItemPrice: loadOriginalItemPrice(),
    cashDiscount: loadCashDiscount(),
    cashDiscountLocked: loadCashDiscountLocked(),
    autoAdjust: loadAutoAdjust(),
    theme: loadTheme(),
    showCashDiscount: loadShowCashDiscount()
  };
}

// Importér storage state
export function importState(state) {
  if (!state || typeof state !== 'object') {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(state, 'cart')) saveCart(state.cart);
  if (Object.prototype.hasOwnProperty.call(state, 'streaming')) saveSelectedStreaming(state.streaming);
  if (typeof state.mobileCost === 'number') saveCustomerMobileCost(state.mobileCost);
  if (typeof state.originalItemPrice === 'number') saveOriginalItemPrice(state.originalItemPrice);
  if (typeof state.cashDiscount === 'number' || state.cashDiscount === null) saveCashDiscount(state.cashDiscount);
  if (typeof state.cashDiscountLocked === 'boolean') saveCashDiscountLocked(state.cashDiscountLocked);
  if (typeof state.autoAdjust === 'boolean') saveAutoAdjust(state.autoAdjust);
  if (Object.prototype.hasOwnProperty.call(state, 'theme')) saveTheme(state.theme);
  if (typeof state.showCashDiscount === 'boolean') saveShowCashDiscount(state.showCashDiscount);
}

