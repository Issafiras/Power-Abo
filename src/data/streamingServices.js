/**
 * Streaming-tjenester database
 * Indeholder alle tilgængelige streaming-tjenester med priser
 */

export const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 79,
    logo: '🎬',
    category: 'streaming'
  },
  {
    id: 'viaplay',
    name: 'Viaplay',
    price: 349,
    logo: '📺',
    category: 'streaming'
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    price: 79,
    logo: '🎭',
    category: 'streaming'
  },
  {
    id: 'tv2-play',
    name: 'TV2 Play',
    price: 119,
    logo: '📡',
    category: 'streaming'
  },
  {
    id: 'saxo',
    name: 'Saxo',
    price: 129,
    logo: '📚',
    category: 'streaming'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    price: 89,
    logo: '🏰',
    category: 'streaming'
  },
  {
    id: 'skyshowtime',
    name: 'SkyShowtime',
    price: 69,
    logo: '🌟',
    category: 'streaming'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    price: 69,
    logo: '📹',
    category: 'streaming'
  },
  {
    id: 'musik',
    name: 'Musik (Spotify/Apple Music)',
    price: 119,
    logo: '🎵',
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

