/* eslint-disable no-console */
/**
 * Console Logger Utility
 * Håndterer struktureret logging med forskellige niveauer og kategorier
 */

// Log niveauer
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Farver til konsol output (ANSI escape codes)
const COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m', // Grøn
  WARN: '\x1b[33m', // Gul
  ERROR: '\x1b[31m', // Rød
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
};

// Emojis til forskellige log niveauer
const ICONS = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
};

class Logger {
  constructor() {
    // Standard log niveau baseret på environment
    // Standard log niveau baseret på environment
    // Håndter både Vite (import.meta.env) og Node.js miljøer
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

    this.level = isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
    this.enabled = true;
    this.showTimestamp = true;
    this.showIcons = true;
    this.useColors = true;
    this.categories = new Set();
    this.mutedCategories = new Set();
  }

  /**
   * Sæt minimums log niveau
   * @param {number} level - Log niveau fra LOG_LEVELS
   */
  setLevel(level) {
    if (level >= LOG_LEVELS.DEBUG && level <= LOG_LEVELS.NONE) {
      this.level = level;
    }
  }

  /**
   * Aktiver eller deaktiver logging
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Aktiver eller deaktiver timestamps
   * @param {boolean} show
   */
  setShowTimestamp(show) {
    this.showTimestamp = show;
  }

  /**
   * Aktiver eller deaktiver ikoner
   * @param {boolean} show
   */
  setShowIcons(show) {
    this.showIcons = show;
  }

  /**
   * Aktiver eller deaktiver farver
   * @param {boolean} use
   */
  setUseColors(use) {
    this.useColors = use;
  }

  /**
   * Mute en specifik kategori
   * @param {string} category
   */
  muteCategory(category) {
    this.mutedCategories.add(category);
  }

  /**
   * Unmute en specifik kategori
   * @param {string} category
   */
  unmuteCategory(category) {
    this.mutedCategories.delete(category);
  }

  /**
   * Tjek om en kategori er muted
   * @param {string} category
   * @returns {boolean}
   */
  isCategoryMuted(category) {
    return this.mutedCategories.has(category);
  }

  /**
   * Formater timestamp
   * @returns {string}
   */
  _getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Formater log prefix
   * @param {string} level - Log niveau navn
   * @param {string} category - Log kategori
   * @returns {string}
   */
  _getPrefix(level, category) {
    let prefix = '';

    if (this.showTimestamp) {
      const timestamp = this._getTimestamp();
      prefix += this.useColors ? `${COLORS.DIM}${timestamp}${COLORS.RESET} ` : `[${timestamp}] `;
    }

    if (this.showIcons) {
      prefix += `${ICONS[level]} `;
    }

    const levelText = level.padEnd(5);
    if (this.useColors) {
      prefix += `${COLORS.BOLD}${COLORS[level]}${levelText}${COLORS.RESET}`;
    } else {
      prefix += `[${levelText}]`;
    }

    if (category) {
      const categoryText = `[${category}]`;
      prefix += this.useColors
        ? ` ${COLORS.DIM}${categoryText}${COLORS.RESET}`
        : ` ${categoryText}`;
    }

    return prefix;
  }

  /**
   * Intern log metode
   * @param {string} level - Log niveau navn
   * @param {number} levelValue - Log niveau værdi
   * @param {string} category - Log kategori
   * @param {...any} args - Log argumenter
   */
  _log(level, levelValue, category, ...args) {
    if (!this.enabled || levelValue < this.level) {
      return;
    }

    if (category && this.isCategoryMuted(category)) {
      return;
    }

    if (category) {
      this.categories.add(category);
    }

    const prefix = this._getPrefix(level, category);
    const consoleMethod =
      level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : level === 'DEBUG' ? 'debug' : 'log';

    console[consoleMethod](prefix, ...args);
  }

  /**
   * Debug log
   * @param {string} category - Log kategori
   * @param {...any} args - Data at logge
   */
  debug(category, ...args) {
    this._log('DEBUG', LOG_LEVELS.DEBUG, category, ...args);
  }

  /**
   * Info log
   * @param {string} category - Log kategori
   * @param {...any} args - Data at logge
   */
  info(category, ...args) {
    this._log('INFO', LOG_LEVELS.INFO, category, ...args);
  }

  /**
   * Warning log
   * @param {string} category - Log kategori
   * @param {...any} args - Data at logge
   */
  warn(category, ...args) {
    this._log('WARN', LOG_LEVELS.WARN, category, ...args);
  }

  /**
   * Error log
   * @param {string} category - Log kategori
   * @param {...any} args - Data at logge
   */
  error(category, ...args) {
    this._log('ERROR', LOG_LEVELS.ERROR, category, ...args);
  }

  /**
   * Log en gruppe (collapsible i DevTools)
   * @param {string} category - Log kategori
   * @param {string} groupName - Gruppe navn
   * @param {Function} callback - Funktion der kalder log metoder
   * @param {boolean} collapsed - Om gruppen skal være collapsed som standard
   */
  group(category, groupName, callback, collapsed = false) {
    if (!this.enabled || this.level >= LOG_LEVELS.NONE) {
      return;
    }

    if (category && this.isCategoryMuted(category)) {
      return;
    }

    const prefix = this._getPrefix('INFO', category);

    if (collapsed) {
      console.groupCollapsed(`${prefix} ${groupName}`);
    } else {
      console.group(`${prefix} ${groupName}`);
    }

    try {
      callback();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Log en tabel
   * @param {string} category - Log kategori
   * @param {any} data - Data at vise i tabel
   * @param {Array<string>} columns - Kolonner at vise (optional)
   */
  table(category, data, columns) {
    if (!this.enabled || this.level > LOG_LEVELS.INFO) {
      return;
    }

    if (category && this.isCategoryMuted(category)) {
      return;
    }

    const prefix = this._getPrefix('INFO', category);
    console.log(prefix);
    console.table(data, columns);
  }

  /**
   * Start en timer
   * @param {string} category - Log kategori
   * @param {string} label - Timer label
   */
  time(category, label) {
    if (!this.enabled || this.level > LOG_LEVELS.DEBUG) {
      return;
    }

    if (category && this.isCategoryMuted(category)) {
      return;
    }

    const timerLabel = category ? `${category}:${label}` : label;
    console.time(timerLabel);
  }

  /**
   * Stop en timer
   * @param {string} category - Log kategori
   * @param {string} label - Timer label
   */
  timeEnd(category, label) {
    if (!this.enabled || this.level > LOG_LEVELS.DEBUG) {
      return;
    }

    if (category && this.isCategoryMuted(category)) {
      return;
    }

    const timerLabel = category ? `${category}:${label}` : label;
    console.timeEnd(timerLabel);
  }

  /**
   * Vis alle registrerede kategorier
   * @returns {Array<string>}
   */
  getCategories() {
    return Array.from(this.categories).sort();
  }

  /**
   * Clear alle tracked kategorier (primært til testing)
   */
  clearCategories() {
    this.categories.clear();
  }

  /**
   * Vis aktuel konfiguration
   */
  showConfig() {
    console.log('🔧 Logger Configuration:');
    console.log({
      enabled: this.enabled,
      level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.level),
      showTimestamp: this.showTimestamp,
      showIcons: this.showIcons,
      useColors: this.useColors,
      categories: this.getCategories(),
      mutedCategories: Array.from(this.mutedCategories),
    });
  }
}

// Singleton instance
const logger = new Logger();

// Eksporter singleton og LOG_LEVELS
export { logger };
export default logger;
