/**
 * Eksempler på brug af Logger utility
 *
 * Dette er en eksempel-fil der viser, hvordan logger kan bruges i projektet.
 * Slet denne fil når du er fortrolig med logger'en.
 */

import logger, { LOG_LEVELS } from './logger.js';

// ============================================
// BASIC USAGE
// ============================================

// Simple logs med forskellige niveauer
logger.debug('App', 'Dette er en debug besked');
logger.info('App', 'Applikationen er startet');
logger.warn('App', 'Dette er en advarsel');
logger.error('App', 'Dette er en fejl');

// ============================================
// KATEGORIER
// ============================================

// Brug kategorier til at organisere logs
logger.info('API', 'Fetching data from backend...');
logger.info('Storage', 'Loading cart from localStorage');
logger.info('Calculations', 'Computing optimal plan');

// Log med multiple argumenter
logger.debug('Cart', 'Current cart items:', { items: [1, 2, 3], total: 100 });
logger.info('User', 'User preferences:', { theme: 'dark', notifications: true });

// ============================================
// KONFIGURATION
// ============================================

// Sæt minimum log niveau (kun vis WARN og ERROR)
logger.setLevel(LOG_LEVELS.WARN);

// Deaktiver timestamps
logger.setShowTimestamp(false);

// Deaktiver ikoner
logger.setShowIcons(false);

// Deaktiver farver (god til CI/CD logs)
logger.setUseColors(false);

// Slå al logging fra
logger.setEnabled(false);

// Slå logging til igen
logger.setEnabled(true);

// Gendan standard indstillinger
logger.setLevel(LOG_LEVELS.DEBUG);
logger.setShowTimestamp(true);
logger.setShowIcons(true);
logger.setUseColors(true);

// ============================================
// MUTE KATEGORIER
// ============================================

// Mute en kategori (f.eks. for at undgå spam)
logger.muteCategory('API');
logger.info('API', 'This will NOT be logged');

// Unmute kategorien igen
logger.unmuteCategory('API');
logger.info('API', 'This WILL be logged');

// ============================================
// GRUPPER
// ============================================

// Log relateret information i en gruppe
logger.group('Cart', 'Cart Details', () => {
  logger.info('Cart', 'Items: 3');
  logger.info('Cart', 'Subtotal: 299 kr');
  logger.info('Cart', 'Discount: 50 kr');
  logger.info('Cart', 'Total: 249 kr');
});

// Collapsed gruppe (lukket som standard i DevTools)
logger.group(
  'API',
  'API Response',
  () => {
    logger.debug('API', 'Status: 200');
    logger.debug('API', 'Headers:', { 'content-type': 'application/json' });
    logger.debug('API', 'Body:', { data: [] });
  },
  true
);

// ============================================
// TABELLER
// ============================================

// Vis data i tabel format
const plans = [
  { id: 1, provider: 'Telmore', price: 99, data: '50GB' },
  { id: 2, provider: 'CBB', price: 89, data: '40GB' },
  { id: 3, provider: 'Yousee', price: 129, data: '60GB' },
];

logger.table('Plans', plans);

// Vis kun specifikke kolonner
logger.table('Plans', plans, ['provider', 'price']);

// ============================================
// TIMERS
// ============================================

// Mål hvor lang tid en operation tager
logger.time('Calculations', 'optimize-plan');

// ... udfør beregninger
setTimeout(() => {
  logger.timeEnd('Calculations', 'optimize-plan');
}, 100);

// ============================================
// PRAKTISKE EKSEMPLER
// ============================================

// Eksempel 1: API kald
/*async function fetchPlans() {
  logger.info('API', 'Fetching plans from backend...');
  logger.time('API', 'fetch-plans');

  try {
    const response = await fetch('/api/plans');
    const data = await response.json();

    logger.timeEnd('API', 'fetch-plans');
    logger.info('API', `Successfully fetched ${data.length} plans`);
    logger.debug('API', 'Plans data:', data);

    return data;
  } catch (error) {
    logger.timeEnd('API', 'fetch-plans');
    logger.error('API', 'Failed to fetch plans:', error);
    throw error;
  }
}*/

// Eksempel 2: Beregninger
/*function calculateOptimalPlan(plans, requirements) {
  logger.debug('Calculations', 'Starting optimization with:', { plans, requirements });
  logger.time('Calculations', 'optimize');

  // ... beregnings logik

  const result = plans[0]; // placeholder

  logger.timeEnd('Calculations', 'optimize');
  logger.info('Calculations', 'Found optimal plan:', result);

  return result;
}*/

// Eksempel 3: Storage operationer
/*function saveToStorage(key, value) {
  logger.debug('Storage', `Saving to localStorage: ${key}`);

  try {
    localStorage.setItem(key, JSON.stringify(value));
    logger.info('Storage', `Successfully saved ${key}`);
  } catch (error) {
    logger.error('Storage', `Failed to save ${key}:`, error);
    throw error;
  }
}*/

// Eksempel 4: Komponent lifecycle
/*function MyComponent() {
  logger.debug('Component', 'MyComponent mounted');

  // useEffect
  logger.group(
    'Component',
    'MyComponent Effects',
    () => {
      logger.debug('Component', 'Setting up event listeners');
      logger.debug('Component', 'Fetching initial data');
    },
    true
  );

  return null;
}*/

// ============================================
// UTILITY FUNKTIONER
// ============================================

// Vis alle kategorier der har været brugt
console.log('Used categories:', logger.getCategories());

// Vis aktuel konfiguration
logger.showConfig();

// ============================================
// ENVIRONMENT-BASERET KONFIGURATION
// ============================================

// I main.jsx eller App.jsx kan du konfigurere baseret på environment:
if (import.meta.env.PROD) {
  // I produktion: kun vis warnings og errors
  logger.setLevel(LOG_LEVELS.WARN);
  logger.setShowIcons(false);
  logger.setUseColors(false);
} else {
  // I development: vis alle logs
  logger.setLevel(LOG_LEVELS.DEBUG);
}

// Mute specifikke kategorier i produktion
if (import.meta.env.PROD) {
  logger.muteCategory('Debug');
  logger.muteCategory('Performance');
}
