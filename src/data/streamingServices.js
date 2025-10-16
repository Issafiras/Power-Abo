/**
 * Streaming-tjenester database
 * Indeholder alle tilgængelige streaming-tjenester med priser
 */

export const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 129, // Standard plan
    logo: 'N', // Netflix rød N
    color: '#E50914', // Netflix rød
    bgColor: '#000000', // Netflix sort
    category: 'streaming'
  },
  {
    id: 'viaplay',
    name: 'Viaplay',
    price: 149, // Standard plan
    logo: '▶️', // Viaplay play-knap
    color: '#E91E63', // Viaplay pink
    bgColor: '#1A2332', // Viaplay mørkeblå
    category: 'streaming'
  },
  {
    id: 'hbo-max',
    name: 'Max',
    price: 129, // Standard plan
    logo: 'M', // HBO Max / Max logo
    color: '#FFFFFF', // Max hvid
    bgColor: '#002B5C', // Max mørkeblå
    category: 'streaming'
  },
  {
    id: 'tv2-play',
    name: 'TV2 Play Basis',
    price: 99, // Basis plan
    logo: '📺', // TV2 rød cirkel
    color: '#E30613', // TV2 rød
    bgColor: '#00162E', // TV2 mørkeblå
    category: 'streaming'
  },
  {
    id: 'saxo',
    name: 'Saxo',
    price: 79, // 20 timers plan
    logo: '📖', // Saxo bog
    color: '#FFFFFF', // Saxo hvid
    bgColor: '#E30613', // Saxo rød
    category: 'streaming'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    price: 149, // Standard plan
    logo: '✨', // Disney+ stjerne/magi
    color: '#FFFFFF', // Disney hvid
    bgColor: 'linear-gradient(135deg, #0072D2, #00BCD4)', // Disney gradient
    category: 'streaming'
  },
  {
    id: 'skyshowtime',
    name: 'SkyShowtime',
    price: 89, // Standard plan
    logo: '⭐', // Sky stjerne
    color: '#FFFFFF', // Sky hvid
    bgColor: '#7B2D8E', // Sky lilla
    category: 'streaming'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    price: 59, // Standalone plan
    logo: '▶', // Prime Video play
    color: '#FFFFFF', // Prime hvid
    bgColor: '#00A8E1', // Prime blå
    category: 'streaming'
  },
  {
    id: 'musik',
    name: 'Musik (Spotify/Apple Music)',
    price: 119, // Individual plan
    logo: '🎵', // Musik note
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

