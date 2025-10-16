/**
 * Streaming-tjenester database
 * Indeholder alle tilgængelige streaming-tjenester med priser
 */

export const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 129, // Standard plan
    logo: 'svg', // Custom SVG
    logoText: 'N',
    color: '#E50914', // Netflix rød
    bgColor: '#000000', // Netflix sort
    category: 'streaming'
  },
  {
    id: 'viaplay',
    name: 'Viaplay',
    price: 149, // Standard plan
    logo: 'svg', // Custom SVG
    logoText: '▶',
    color: '#FFFFFF', // Hvid
    bgColor: 'linear-gradient(135deg, #FF0080, #C71585)', // Viaplay pink/magenta gradient
    category: 'streaming'
  },
  {
    id: 'hbo-max',
    name: 'Max',
    price: 129, // Standard plan
    logo: 'text', // Text-based
    logoText: 'MAX',
    color: '#FFFFFF', // Max hvid
    bgColor: '#001489', // Max blå
    category: 'streaming'
  },
  {
    id: 'tv2-play',
    name: 'TV2 Play Basis',
    price: 99, // Basis plan
    logo: 'svg', // Custom SVG circle
    logoText: '2',
    color: '#FFFFFF', // Hvid
    bgColor: '#E30613', // TV2 rød
    category: 'streaming'
  },
  {
    id: 'saxo',
    name: 'Saxo',
    price: 79, // 20 timers plan
    logo: 'text', // Text-based
    logoText: 'saxo',
    color: '#FFFFFF', // Saxo hvid
    bgColor: '#E30613', // Saxo rød
    category: 'streaming'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    price: 149, // Standard plan
    logo: 'text', // Text-based
    logoText: 'Disney+',
    color: '#FFFFFF', // Disney hvid
    bgColor: 'linear-gradient(135deg, #0072D2, #00D4FF)', // Disney gradient
    category: 'streaming'
  },
  {
    id: 'skyshowtime',
    name: 'SkyShowtime',
    price: 89, // Standard plan
    logo: 'text', // Text-based
    logoText: 'SKY',
    color: '#FFFFFF', // Sky hvid
    bgColor: '#7B2D8E', // Sky lilla
    category: 'streaming'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    price: 59, // Standalone plan
    logo: 'text', // Text-based  
    logoText: 'prime',
    color: '#FFFFFF', // Prime hvid
    bgColor: '#00A8E1', // Prime blå
    category: 'streaming'
  },
  {
    id: 'musik',
    name: 'Musik (Spotify/Apple Music)',
    price: 119, // Individual plan
    logo: 'svg', // Custom SVG
    logoText: '♪',
    color: '#1DB954', // Spotify grøn
    bgColor: '#191414', // Spotify sort
    category: 'musik'
  }
];

/**
 * Hent total pris for valgte streaming-tjenester
 * @param {Array<string>} selectedIds - Array af valgte tjeneste-ID'er
 * @returns {number} Total månedlig pris
 */
export function getStreamingTotal(selectedIds) {
  if (!selectedIds || selectedIds.length === 0) return 0;
  
  return streamingServices
    .filter(service => selectedIds.includes(service.id))
    .reduce((total, service) => total + service.price, 0);
}

/**
 * Hent tjeneste-detaljer baseret på ID
 * @param {string} id - Tjeneste-ID
 * @returns {Object|null} Tjeneste-objekt eller null
 */
export function getServiceById(id) {
  return streamingServices.find(service => service.id === id) || null;
}

