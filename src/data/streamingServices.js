/**
 * Streaming-tjenester database
 * Indeholder alle tilgængelige streaming-tjenester med priser
 */

export const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 129, // Standard plan
    logo: '/logos/Netflix.png',
    bgColor: '#000000', // Netflix sort
    category: 'streaming'
  },
  {
    id: 'viaplay',
    name: 'Viaplay',
    price: 149, // Standard plan
    logo: '/logos/Viaplay.png',
    bgColor: '#1F2833', // Viaplay mørk
    category: 'streaming'
  },
  {
    id: 'hbo-max',
    name: 'Max',
    price: 129, // Standard plan
    logo: '/logos/MAX.png',
    bgColor: '#001E3C', // Max mørkeblå
    category: 'streaming'
  },
  {
    id: 'tv2-play',
    name: 'TV2 Play Basis',
    price: 99, // Basis plan
    logo: '/logos/TV2.png',
    bgColor: '#00162E', // TV2 mørkeblå
    category: 'streaming'
  },
  {
    id: 'saxo',
    name: 'Saxo',
    price: 79, // 20 timers plan
    logo: '/logos/Saxo.png',
    bgColor: '#E30613', // Saxo rød
    category: 'streaming'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    price: 149, // Standard plan
    logo: '/logos/Disney+.png',
    bgColor: 'linear-gradient(180deg, #0072D2 0%, #00BCD4 100%)', // Disney gradient
    category: 'streaming'
  },
  {
    id: 'skyshowtime',
    name: 'SkyShowtime',
    price: 89, // Standard plan
    logo: '/logos/SkyshowTime.png',
    bgColor: '#7B2D8E', // Sky lilla
    category: 'streaming'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    price: 59, // Standalone plan
    logo: '/logos/Prime.png',
    bgColor: '#00A8E1', // Prime blå
    category: 'streaming'
  },
  {
    id: 'musik',
    name: 'Musik (Spotify/Apple Music)',
    price: 119, // Individual plan
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

