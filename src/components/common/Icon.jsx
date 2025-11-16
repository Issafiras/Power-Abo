/**
 * Simpel Icon komponent uden eksterne dependencies.
 * Drop-in replacement for tidligere lucide-react baseret ikon-system
 * (for at undgå runtime-fejlen omkring React.forwardRef i vendor bundlen).
 */

import React from 'react';

// Letvægts mapping: vi bruger Unicode-symboler som grafiske ikoner.
// Navnene matcher de tidligere ikon-navne, så resten af koden kan være uændret.
const glyphMap = {
  // Mobil og abonnementer
  smartphone: '📱',
  mobile: '📱',
  phone: '📱',

  // Finans
  creditCard: '💳',
  wallet: '👛',
  money: '💰',

  // Priser og produkter
  tag: '🏷️',
  price: '🏷️',

  // Søgning / scan
  search: '🔍',
  scan: '📷',
  camera: '📷',

  // Actions
  rocket: '🚀',
  sparkles: '✨',
  lock: '🔒',
  unlock: '🔓',
  refresh: '🔄',
  reset: '↺',
  gift: '🎁',

  // Streaming og media
  tv: '📺',
  streaming: '📺',
  film: '🎬',

  // Status
  check: '✔️',
  checkCircle: '✅',
  plus: '+',
  warning: '⚠️',
  error: '⚠️',

  // Personer
  user: '👤',
  customer: '👤',
  users: '👥',
  family: '👨‍👩‍👧‍👦',

  // Business
  briefcase: '💼',
  offer: '💼',

  // UI / diverse
  zap: '⚡',
  lightning: '⚡',
  sun: '☀️',
  moon: '🌙',
  cart: '🛒',
  info: 'ℹ️',
  presentation: '🖥️',
  print: '🖨️',
  chevronRight: '›',
  chevronLeft: '‹',
  arrowRight: '→',
  arrowLeft: '←',
  chart: '📊',
  analytics: '📈',
  close: '✕',
  x: '✕',
  torch: '🔦',
  torchOff: '🚫',
  book: '📘',
  helpCircle: '❓',
  help: '❓',
  star: '★',
  trendingDown: '📉',
  settings: '⚙️',
};

export default function Icon({ name, size = 20, className = '', style = {}, ...props }) {
  const glyph = glyphMap[name] || '●';

  const mergedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typeof size === 'number' ? `${size}px` : size,
    lineHeight: 1,
    // Bevar evt. custom styles
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      className={className}
      style={mergedStyle}
      {...props}
    >
      {glyph}
    </span>
  );
}


