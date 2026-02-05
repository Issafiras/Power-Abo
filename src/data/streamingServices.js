/**
 * Streaming-tjenester database
 * Indeholder alle tilgængelige streaming-tjenester med priser
 */

export const streamingServices = [
  {
    id: 'netflix',
    name: 'Netflix',
    price: 129, // Default/fallback price
    logo: 'https://issafiras.github.io/Power-Abo/logos/Netflix.png',
    bgColor: '#000000',
    category: 'streaming',
    variants: [
      {
        id: 'netflix-basis',
        name: 'Netflix Basis',
        price: 89,
        description: '1 enhed, HD'
      },
      {
        id: 'netflix-standard',
        name: 'Netflix Standard',
        price: 129,
        description: '2 enheder, HD'
      },
      {
        id: 'netflix-premium',
        name: 'Netflix Premium',
        price: 169,
        description: '4 enheder, Ultra HD'
      }
    ]
  },
  {
    id: 'viaplay',
    name: 'Viaplay',
    price: 149, // Standard plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/Viaplay.png',
    bgColor: '#1F2833', // Viaplay mørk
    category: 'streaming'
  },
  {
    id: 'hbo-max',
    name: 'Max',
    price: 129, // Standard plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/MAX.png',
    bgColor: '#001E3C', // Max mørkeblå
    category: 'streaming'
  },
  {
    id: 'tv2-play',
    name: 'TV2 Play Basis',
    price: 99, // Basis plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/TV2.png',
    bgColor: '#00162E', // TV2 mørkeblå
    category: 'streaming'
  },
  {
    id: 'saxo',
    name: 'Saxo',
    price: 79, // 20 timers plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/Saxo.png',
    bgColor: '#E30613', // Saxo rød
    category: 'streaming'
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    price: 149, // Standard plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/Disney+.png',
    bgColor: 'linear-gradient(180deg, #0072D2 0%, #00BCD4 100%)', // Disney gradient
    category: 'streaming',
    cbbMixExcluded: true // CBB MIX understøtter ikke Disney+
  },
  {
    id: 'skyshowtime',
    name: 'SkyShowtime',
    price: 89, // Standard plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/SkyshowTime.png',
    bgColor: '#7B2D8E', // Sky lilla
    category: 'streaming'
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    price: 59, // Standalone plan
    logo: 'https://issafiras.github.io/Power-Abo/logos/Prime.png',
    bgColor: '#00A8E1', // Prime blå
    category: 'streaming'
  },
  {
    id: 'musik',
    name: 'Telmore Musik',
    price: 119, // Individual plan
    logoText: '♪',
    color: '#1DB954', // Spotify grøn
    bgColor: '#191414', // Spotify sort
    category: 'musik'
  },

  // CBB MIX UNIKKE TJENESTER
  {
    id: 'podimo',
    name: 'Podimo Premium',
    price: 79, // CBB MIX pris
    logo: 'https://issafiras.github.io/Power-Abo/logos/podimo.png',
    bgColor: '#FF6B35', // Podimo orange
    category: 'podcast',
    cbbMixOnly: true // Kun tilgængelig via CBB MIX
  },
  {
    id: 'mofibo',
    name: 'Mofibo (20 timer)',
    price: 89, // CBB MIX pris
    logo: 'https://issafiras.github.io/Power-Abo/logos/mofibo.png',
    bgColor: '#1A1A1A', // Mofibo sort
    category: 'audiobook',
    cbbMixOnly: true
  },
  {
    id: 'nordisk-film-plus',
    name: 'Nordisk Film+',
    price: 89, // CBB MIX pris
    logo: 'https://issafiras.github.io/Power-Abo/logos/nordisk%20film.png',
    bgColor: '#2C3E50', // Nordisk Film mørkeblå
    category: 'streaming',
    cbbMixOnly: true
  },

];

/**
 * Hent total pris for valgte streaming-tjenester
 * @param {Array<string>} selectedIds - Array af valgte tjeneste-ID'er
 * @returns {number} Total månedlig pris
 */
export function getStreamingTotal(selectedIds) {
  if (!selectedIds || selectedIds.length === 0) return 0;

  return selectedIds.reduce((total, id) => {
    // Check if it's a main service
    const service = streamingServices.find(s => s.id === id);
    if (service) return total + service.price;

    // Check if it's a variant (nested)
    for (const s of streamingServices) {
      if (s.variants) {
        const variant = s.variants.find(v => v.id === id);
        if (variant) return total + variant.price;
      }
    }
    return total;
  }, 0);
}

/**
 * Hent tjeneste-detaljer baseret på ID
 * @param {string} id - Tjeneste-ID
 * @returns {Object|null} Tjeneste-objekt eller null
 */
export function getServiceById(id) {
  const mainService = streamingServices.find(service => service.id === id);
  if (mainService) return mainService;

  // Search in variants
  for (const service of streamingServices) {
    if (service.variants) {
      const variant = service.variants.find(v => v.id === id);
      if (variant) {
        // Return variant but with parent metadata mixed in if needed, 
        // or just the variant with enough info.
        // Let's attach the parent logo/color for UI consistency
        return {
          ...variant,
          logo: service.logo, // Inherit logo
          bgColor: service.bgColor, // Inherit color
          parentId: service.id
        };
      }
    }
  }
  return null;
}

/**
 * Hent CBB MIX specifikke tjenester
 * @returns {Array} CBB MIX tjenester
 */
export function getCBBMixServices() {
  return streamingServices.filter(service =>
    service.cbbMixOnly || service.cbbMixVariant
  );
}

/**
 * Hent tjenester baseret på kategori
 * @param {string} category - Kategori ('streaming', 'musik', 'podcast', 'audiobook')
 * @returns {Array} Filtrerede tjenester
 */
export function getStreamingServicesByCategory(category) {
  return streamingServices.filter(service => service.category === category);
}

/**
 * Hent CBB MIX priser for antal tjenester
 * @param {number} count - Antal tjenester (2-8)
 * @returns {number} CBB MIX pris
 */
export function getCBBMixPrice(count) {
  const cbbMixPricing = {
    2: 160,  // 2 tjenester = 160 kr/md
    3: 210,  // 3 tjenester = 210 kr/md
    4: 260,  // 4 tjenester = 260 kr/md
    5: 310,  // 5 tjenester = 310 kr/md
    6: 360,  // 6 tjenester = 360 kr/md
    7: 410,  // 7 tjenester = 410 kr/md
    8: 460   // 8 tjenester = 460 kr/md
  };

  return cbbMixPricing[count] || 0;
}

