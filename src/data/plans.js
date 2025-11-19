/**
 * Mobilabonnementer database
 * Indeholder alle tilgængelige planer fra Telenor, Telmore og CBB
 */

export const plans = [
  // TELENOR PLANER
  {
    id: 'telenor-25gb',
    provider: 'telenor',
    name: '25 GB',
    data: '25 GB',
    price: 159,
    earnings: 700,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    familyDiscount: true,
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },

  // TELENOR BUSINESS (B2B) PLANER – priser ekskl. moms
  {
    id: 'telenor-b2b-25gb',
    provider: 'telenor-b2b',
    name: 'Business Mobil 25 GB',
    data: '25 GB',
    price: 109, // ekskl. moms
    business: true,
    priceVatExcluded: true,
    features: ['Fri tale', '5G', 'EU Roaming'],
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-b2b-50gb',
    provider: 'telenor-b2b',
    name: 'Business Mobil 50 GB',
    data: '50 GB',
    price: 149, // ekskl. moms
    business: true,
    priceVatExcluded: true,
    features: ['Fri tale', '5G', 'EU Roaming'],
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-b2b-100gb',
    provider: 'telenor-b2b',
    name: 'Business Mobil 100 GB',
    data: '100 GB',
    price: 169, // ekskl. moms
    business: true,
    priceVatExcluded: true,
    features: ['Fri tale', '5G', 'EU Roaming'],
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-b2b-1000gb',
    provider: 'telenor-b2b',
    name: 'Business Mobil 1000 GB',
    data: '1000 GB',
    price: 179, // ekskl. moms
    business: true,
    priceVatExcluded: true,
    features: ['Fri tale', '5G', 'EU Roaming'],
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-70gb',
    provider: 'telenor',
    name: '70 GB',
    data: '70 GB',
    price: 199,
    earnings: 900,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    familyDiscount: true,
    mostPopular: true,
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-120gb',
    provider: 'telenor',
    name: '120 GB',
    data: '120 GB',
    price: 239,
    earnings: 1200,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    familyDiscount: true,
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },
  {
    id: 'telenor-170kr',
    provider: 'telenor',
    name: '100 GB',
    data: '100 GB fri tale',
    price: 170,
    earnings: 900, // Første abonnement
    earningsAdditional: 1100, // Efterfølgende abonnementer (med 50 kr rabat)
    features: ['5G', 'eSIM', '35 GB EU Roaming', '100 GB fri tale', 'Familie'],
    familyDiscount: true,
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: [],
    expiresAt: '2025-12-31' // Udløber i butikken d. 31/12/25
  },
  {
    id: 'telenor-unlimited',
    provider: 'telenor',
    name: 'Fri Data',
    data: 'Fri Data',
    price: 289,
    earnings: 1300,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie', 'Ubegrænset'],
    familyDiscount: true,
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: []
  },

  // TELMORE PLANER
  {
    id: 'telmore-30gb',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: '30 GB',
    data: '30 GB',
    price: 129,
    earnings: 400,
    features: ['5G', 'EU Roaming'],
    color: '#002788',
    streaming: []
  },
  {
    id: 'telmore-70gb',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: '150 GB',
    data: '150 GB',
    price: 149,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#002788',
    streaming: []
  },
  {
    id: 'telmore-60gb',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: '60 GB',
    data: '60 GB',
    price: 169,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#002788',
    streaming: []
  },
  {
    id: 'telmore-unlimited-basic',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: 'Fri Data',
    data: 'Fri Data',
    price: 229,
    earnings: 700,
    features: ['5G', 'EU Roaming', 'Ubegrænset'],
    color: '#002788',
    streaming: []
  },
  {
    id: 'telmore-100gb-2streaming',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: '100 GB + 2 Streaming',
    data: '100 GB',
    price: 299,
    introPrice: 99,
    introMonths: 1,
    earnings: 1000,
    features: ['5G', 'EU Roaming', '2 Streaming', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    streamingCount: 2
  },
  {
    id: 'telmore-unlimited-3streaming',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: 'Fri Data + 3 Streaming',
    data: 'Fri Data',
    price: 399,
    introPrice: 99,
    introMonths: 1,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '3 Streaming', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    streamingCount: 3
  },
  {
    id: 'telmore-unlimited-4streaming',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: 'Fri Data + 4 Streaming',
    data: 'Fri Data',
    price: 449,
    introPrice: 99,
    introMonths: 1,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '4 Streaming', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    streamingCount: 4
  },
  {
    id: 'telmore-unlimited-5streaming',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: 'Fri Data + 5 Streaming',
    data: 'Fri Data',
    price: 499,
    introPrice: 99,
    introMonths: 1,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '5 Streaming', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    streamingCount: 5
  },
  {
    id: 'telmore-ultimate',
    provider: 'telmore',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: 'Ultimate (9 Streaming)',
    data: 'Fri Data',
    price: 599,
    introPrice: 99,
    introMonths: 1,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '9 Streaming', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    streamingCount: 9
  },

  // CBB PLANER
  {
    id: 'cbb-60gb',
    provider: 'cbb',
    logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png',
    name: '60 GB',
    data: '60 GB',
    price: 109,
    earnings: 400,
    features: ['4G', 'EU Roaming', 'CBB MIX'],
    color: '#410016',
    streaming: [],
    cbbMixAvailable: true, // CBB MIX tilgængelig
    cbbMixPricing: {
      2: 160,  // 2 tjenester = 160 kr/md
      3: 210,  // 3 tjenester = 210 kr/md
      4: 260,  // 4 tjenester = 260 kr/md
      5: 310,  // 5 tjenester = 310 kr/md
      6: 360,  // 6 tjenester = 360 kr/md
      7: 410,  // 7 tjenester = 410 kr/md
      8: 460   // 8 tjenester = 460 kr/md
    }
  },
  {
    id: 'cbb-200gb',
    provider: 'cbb',
    logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png',
    name: '200 GB',
    data: '200 GB',
    price: 129,
    earnings: 800,
    features: ['4G', 'EU Roaming', 'CBB MIX'],
    color: '#410016',
    streaming: [],
    cbbMixAvailable: true,
    cbbMixPricing: {
      2: 160,  // 2 tjenester = 160 kr/md
      3: 210,  // 3 tjenester = 210 kr/md
      4: 260,  // 4 tjenester = 260 kr/md
      5: 310,  // 5 tjenester = 310 kr/md
      6: 360,  // 6 tjenester = 360 kr/md
      7: 410,  // 7 tjenester = 410 kr/md
      8: 460   // 8 tjenester = 460 kr/md
    }
  },
  {
    id: 'cbb-500gb',
    provider: 'cbb',
    logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png',
    name: '500 GB',
    data: '500 GB',
    price: 149,
    earnings: 900,
    features: ['4G', 'EU Roaming', 'CBB MIX'],
    color: '#410016',
    streaming: [],
    cbbMixAvailable: true,
    cbbMixPricing: {
      2: 160,  // 2 tjenester = 160 kr/md
      3: 210,  // 3 tjenester = 210 kr/md
      4: 260,  // 4 tjenester = 260 kr/md
      5: 310,  // 5 tjenester = 310 kr/md
      6: 360,  // 6 tjenester = 360 kr/md
      7: 410,  // 7 tjenester = 410 kr/md
      8: 460   // 8 tjenester = 460 kr/md
    }
  },
  {
    id: 'cbb-100gb-world',
    provider: 'cbb',
    logo: 'https://issafiras.github.io/Power-Abo/logos/CBB_Mobil_800x400.png',
    name: '100 GB World-data',
    data: '100 GB',
    price: 199,
    earnings: 800,
    features: ['4G', 'World Roaming', 'Global', 'CBB MIX'],
    color: '#410016',
    streaming: [],
    cbbMixAvailable: true,
    cbbMixPricing: {
      2: 160,  // 2 tjenester = 160 kr/md
      3: 210,  // 3 tjenester = 210 kr/md
      4: 260,  // 4 tjenester = 260 kr/md
      5: 310,  // 5 tjenester = 310 kr/md
      6: 360,  // 6 tjenester = 360 kr/md
      7: 410,  // 7 tjenester = 410 kr/md
      8: 460   // 8 tjenester = 460 kr/md
    }
  },

  // TELMORE BREDBÅND PLANER
  {
    id: 'telmore-5g-internet',
    provider: 'telmore-bredbånd',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telmore-logo.png',
    name: '5G Internet',
    data: 'Fri Data',
    price: 289,
    introPrice: 139,
    introMonths: 3,
    earnings: 900,
    features: ['5G', 'Fri Data', 'Router inkl.', 'Intro-pris'],
    color: '#002788',
    streaming: [],
    type: 'broadband'
  },

  // TELENOR BREDBÅND PLANER
  {
    id: 'telenor-bredbånd-fri-data',
    provider: 'telenor-bredbånd',
    name: 'Fri Data',
    data: 'Fri Data',
    price: 299,
    introPrice: 99,
    introMonths: 6,
    earnings: 1000,
    features: ['5G', 'Fri Data', 'Router inkl.', 'Intro-pris'],
    color: '#0207b2',
    logo: 'https://issafiras.github.io/Power-Abo/logos/Telenor.png',
    streaming: [],
    type: 'broadband',
    expiresAt: '2025-12-31' // Udløber i butikken d. 31/12/25
  }
];

/**
 * Hent planer baseret på provider
 * @param {string} provider - Provider navn ('telenor', 'telmore', 'cbb', eller 'all')
 * @returns {Array} Filtrerede planer
 */
export function getPlansByProvider(provider) {
  if (provider === 'all') return plans;
  return plans.filter(plan => plan.provider === provider);
}

/**
 * Søg i planer
 * @param {string} query - Søgestreng
 * @returns {Array} Matchende planer
 */
export function searchPlans(query) {
  if (!query) return plans;
  
  const lowerQuery = query.toLowerCase();
  return plans.filter(plan => {
    return (
      plan.name.toLowerCase().includes(lowerQuery) ||
      plan.data.toLowerCase().includes(lowerQuery) ||
      plan.provider.toLowerCase().includes(lowerQuery) ||
      plan.features.some(f => f.toLowerCase().includes(lowerQuery)) ||
      plan.price.toString().includes(lowerQuery)
    );
  });
}

/**
 * Hent plan baseret på ID
 * @param {string} id - Plan ID
 * @returns {Object|null} Plan objekt eller null
 */
export function getPlanById(id) {
  return plans.find(plan => plan.id === id) || null;
}

