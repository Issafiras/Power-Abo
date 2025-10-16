/**
 * Validerings-funktioner
 * Sikrer data-integritet og korrekt input
 */

/**
 * Validér pris-input
 * @param {any} value - Værdi at validere
 * @returns {Object} { valid: boolean, error: string|null, value: number }
 */
export function validatePrice(value) {
  // Hvis null eller undefined, returner null (kontant rabat slået fra)
  if (value === null || value === undefined || value === '') {
    return { valid: true, error: null, value: null };
  }

  // Konvertér til nummer
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Check om det er et gyldigt nummer
  if (isNaN(num)) {
    return { valid: false, error: 'Indtast venligst et gyldigt tal', value: null };
  }

  // Check om det er negativt
  if (num < 0) {
    return { valid: false, error: 'Prisen kan ikke være negativ', value: null };
  }

  // Check om det er for stort
  if (num > 10000) {
    return { valid: false, error: 'Prisen virker usædvanlig høj', value: null };
  }

  return { valid: true, error: null, value: num };
}

/**
 * Validér quantity (antal linjer)
 * @param {any} value - Værdi at validere
 * @returns {Object} { valid: boolean, error: string|null, value: number }
 */
export function validateQuantity(value) {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: 'Antal skal være et heltal', value: 1 };
  }

  if (num < 1) {
    return { valid: false, error: 'Antal skal være mindst 1', value: 1 };
  }

  if (num > 20) {
    return { valid: false, error: 'Maksimum 20 linjer tilladt', value: 20 };
  }

  return { valid: true, error: null, value: num };
}

/**
 * Validér søgestreng
 * @param {string} query - Søgestreng
 * @returns {Object} { valid: boolean, sanitized: string }
 */
export function validateSearchQuery(query) {
  if (typeof query !== 'string') {
    return { valid: false, sanitized: '' };
  }

  // Fjern potentielt farlige tegn
  const sanitized = query
    .replace(/<script>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim()
    .substring(0, 100); // Max 100 karakterer

  return { valid: true, sanitized };
}

/**
 * Validér plan objekt
 * @param {Object} plan - Plan objekt
 * @returns {boolean} True hvis valid
 */
export function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') return false;

  const requiredFields = ['id', 'provider', 'name', 'price'];
  return requiredFields.every(field => plan.hasOwnProperty(field));
}

/**
 * Validér kurv item
 * @param {Object} item - Kurv item
 * @returns {boolean} True hvis valid
 */
export function validateCartItem(item) {
  if (!item || typeof item !== 'object') return false;

  return (
    validatePlan(item.plan) &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

/**
 * Validér array af streaming-ID'er
 * @param {Array} streamingIds - Array af ID'er
 * @returns {boolean} True hvis valid
 */
export function validateStreamingSelection(streamingIds) {
  if (!Array.isArray(streamingIds)) return false;

  // Alle items skal være strenge
  return streamingIds.every(id => typeof id === 'string' && id.length > 0);
}

/**
 * Sanitize HTML (simpel version)
 * @param {string} str - Streng at sanitize
 * @returns {string} Sanitized streng
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Check om browser understøtter localStorage
 * @returns {boolean} True hvis understøttet
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

