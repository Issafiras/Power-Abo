/**
 * Mobilabonnementer database
 * Indeholder alle tilgængelige planer fra Telenor, Telmore og CBB
 */

export const plans = [
  // TELENOR PLANER
  {
    id: 'telenor-20gb',
    provider: 'telenor',
    name: '20 GB',
    data: '20 GB',
    price: 149,
    earnings: 700,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    familyDiscount: true,
    color: '#38bdf8',
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
    color: '#38bdf8',
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
    color: '#38bdf8',
    streaming: []
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
    color: '#38bdf8',
    streaming: []
  },

  // TELMORE PLANER
  {
    id: 'telmore-30gb',
    provider: 'telmore',
    name: '30 GB',
    data: '30 GB',
    price: 129,
    earnings: 400,
    features: ['5G', 'EU Roaming'],
    color: '#ff6b1a',
    streaming: []
  },
  {
    id: 'telmore-70gb',
    provider: 'telmore',
    name: '70 GB',
    data: '70 GB',
    price: 149,
    introPrice: 74,
    introMonths: 3,
    earnings: 700,
    features: ['5G', 'EU Roaming', 'Intro-pris'],
    color: '#ff6b1a',
    streaming: []
  },
  {
    id: 'telmore-60gb',
    provider: 'telmore',
    name: '60 GB',
    data: '60 GB',
    price: 169,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#ff6b1a',
    streaming: []
  },
  {
    id: 'telmore-100gb-hbo',
    provider: 'telmore',
    name: '100 GB + HBO Max',
    data: '100 GB',
    price: 219,
    introPrice: 99,
    introMonths: 1,
    earnings: 700,
    features: ['5G', 'EU Roaming', 'HBO Max', 'Intro-pris'],
    color: '#ff6b1a',
    streaming: ['hbo-max']
  },
  {
    id: 'telmore-unlimited-basic',
    provider: 'telmore',
    name: 'Fri Data',
    data: 'Fri Data',
    price: 229,
    earnings: 700,
    features: ['5G', 'EU Roaming', 'Ubegrænset'],
    color: '#ff6b1a',
    streaming: []
  },
  {
    id: 'telmore-100gb-2streaming',
    provider: 'telmore',
    name: '100 GB + 2 Streaming',
    data: '100 GB',
    price: 299,
    introPrice: 99,
    introMonths: 1,
    earnings: 1000,
    features: ['5G', 'EU Roaming', '2 Streaming', 'Intro-pris'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 2
  },
  {
    id: 'telmore-unlimited-3streaming',
    provider: 'telmore',
    name: 'Fri Data + 3 Streaming',
    data: 'Fri Data',
    price: 399,
    introPrice: 99,
    introMonths: 1,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '3 Streaming', 'Intro-pris'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 3
  },
  {
    id: 'telmore-unlimited-4streaming',
    provider: 'telmore',
    name: 'Fri Data + 4 Streaming',
    data: 'Fri Data',
    price: 449,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '4 Streaming'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 4
  },
  {
    id: 'telmore-unlimited-5streaming',
    provider: 'telmore',
    name: 'Fri Data + 5 Streaming',
    data: 'Fri Data',
    price: 499,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '5 Streaming'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 5
  },
  {
    id: 'telmore-premium',
    provider: 'telmore',
    name: 'Premium (8 Streaming)',
    data: 'Fri Data',
    price: 559,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '8 Streaming'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 8
  },
  {
    id: 'telmore-ultimate',
    provider: 'telmore',
    name: 'Ultimate (9 Streaming)',
    data: 'Fri Data',
    price: 599,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Ubegrænset', '9 Streaming'],
    color: '#ff6b1a',
    streaming: [],
    streamingCount: 9
  },

  // CBB PLANER
  {
    id: 'cbb-60gb',
    provider: 'cbb',
    name: '60 GB',
    data: '60 GB',
    price: 109,
    earnings: 300,
    features: ['4G', 'EU Roaming'],
    color: '#a855f7',
    streaming: []
  },
  {
    id: 'cbb-200gb',
    provider: 'cbb',
    name: '200 GB',
    data: '200 GB',
    price: 129,
    earnings: 500,
    features: ['4G', 'EU Roaming'],
    color: '#a855f7',
    streaming: []
  },
  {
    id: 'cbb-500gb',
    provider: 'cbb',
    name: '500 GB',
    data: '500 GB',
    price: 149,
    earnings: 800,
    features: ['4G', 'EU Roaming'],
    color: '#a855f7',
    streaming: []
  },
  {
    id: 'cbb-100gb-world',
    provider: 'cbb',
    name: '100 GB World-data',
    data: '100 GB',
    price: 199,
    earnings: 800,
    features: ['4G', 'World Roaming', 'Global'],
    color: '#a855f7',
    streaming: []
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

