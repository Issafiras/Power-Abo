// plans.js - Alle mobilabonnementer fra Telenor, Telmore og CBB

export const PLANS = [
  // Telenor pakker
  {
    id: 'ten-20',
    brand: 'Telenor',
    name: '20 GB',
    dataGB: 20,
    unlimited: false,
    price: 149,
    earnings: 700,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    color: '#38bdf8',
    roamingGB: 20
  },
  {
    id: 'ten-100-offer',
    brand: 'Telenor',
    name: '100 GB (Tilbud)',
    dataGB: 100,
    unlimited: false,
    price: 170,
    earnings: 1000,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie', 'Tilbud'],
    color: '#38bdf8',
    offer: true,
    expiry: '28/9',
    roamingGB: 40
  },
  {
    id: 'ten-70',
    brand: 'Telenor',
    name: '70 GB',
    dataGB: 70,
    unlimited: false,
    price: 199,
    earnings: 900,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    color: '#38bdf8',
    roamingGB: 35
  },
  {
    id: 'ten-120',
    brand: 'Telenor',
    name: '120 GB',
    dataGB: 120,
    unlimited: false,
    price: 239,
    earnings: 1200,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    color: '#38bdf8',
    roamingGB: 45
  },
  {
    id: 'ten-unl',
    brand: 'Telenor',
    name: 'Fri data',
    dataGB: Infinity,
    unlimited: true,
    price: 289,
    earnings: 1300,
    features: ['5G', 'eSIM', 'EU Roaming', 'Familie'],
    color: '#38bdf8',
    roamingGB: 50
  },
  
  // Telmore pakker
  {
    id: 'tel-30',
    brand: 'Telmore',
    name: '30 GB',
    dataGB: 30,
    unlimited: false,
    price: 129,
    earnings: 400,
    features: ['5G', 'EU Roaming'],
    color: '#ff8b4a',
    roamingGB: 20
  },
  {
    id: 'tel-70',
    brand: 'Telmore',
    name: '70 GB',
    dataGB: 70,
    unlimited: false,
    price: 149,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#ff8b4a',
    introPrice: 74,
    introMonths: 3,
    roamingGB: 25
  },
  {
    id: 'tel-60',
    brand: 'Telmore',
    name: '60 GB',
    dataGB: 60,
    unlimited: false,
    price: 169,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#ff8b4a',
    roamingGB: 25
  },
  {
    id: 'tel-100',
    brand: 'Telmore',
    name: '100 GB',
    dataGB: 100,
    unlimited: false,
    price: 219,
    earnings: 700,
    features: ['5G', 'EU Roaming', 'HBO Max'],
    color: '#ff8b4a',
    introPrice: 99,
    introMonths: 1,
    roamingGB: 30
  },
  {
    id: 'tel-unl',
    brand: 'Telmore',
    name: 'Fri data',
    dataGB: Infinity,
    unlimited: true,
    price: 229,
    earnings: 700,
    features: ['5G', 'EU Roaming'],
    color: '#ff8b4a',
    roamingGB: 50
  },
  {
    id: 'tel-play-100',
    brand: 'Telmore',
    name: '100 GB + 2 tjenester',
    dataGB: 100,
    unlimited: false,
    price: 299,
    earnings: 1000,
    features: ['5G', 'EU Roaming', 'Streaming inkl.'],
    color: '#ff8b4a',
    introPrice: 99,
    introMonths: 1,
    streamingCount: 2,
    roamingGB: 50
  },
  {
    id: 'tel-play-3',
    brand: 'Telmore',
    name: 'Fri data + 3 tjenester',
    dataGB: Infinity,
    unlimited: true,
    price: 399,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Streaming (3 valgfrie)'],
    color: '#ff8b4a',
    introPrice: 99,
    introMonths: 1,
    streamingCount: 3,
    roamingGB: 70
  },
  {
    id: 'tel-play-4',
    brand: 'Telmore',
    name: 'Fri data + 4 tjenester',
    dataGB: Infinity,
    unlimited: true,
    price: 449,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Streaming (4 valgfrie)'],
    color: '#ff8b4a',
    introPrice: 99,
    introMonths: 1,
    streamingCount: 4,
    roamingGB: 64
  },
  {
    id: 'tel-play-5',
    brand: 'Telmore',
    name: 'Fri data + 5 tjenester',
    dataGB: Infinity,
    unlimited: true,
    price: 499,
    earnings: 1100,
    features: ['5G', 'EU Roaming', 'Streaming (5 valgfrie)'],
    color: '#ff8b4a',
    introPrice: 99,
    introMonths: 1,
    streamingCount: 5,
    roamingGB: 64
  },
  {
    id: 'tel-premium',
    brand: 'Telmore',
    name: 'Premium',
    dataGB: Infinity,
    unlimited: true,
    price: 559,
    earnings: 1100,
    features: ['5G', 'EU Roaming (94 GB)', '8 Streaming tjenester', 'Premium'],
    color: '#ff8b4a',
    streamingCount: 8,
    roamingGB: 94
  },
  {
    id: 'tel-ultimate',
    brand: 'Telmore',
    name: 'Ultimate',
    dataGB: Infinity,
    unlimited: true,
    price: 599,
    earnings: 1100,
    features: ['5G', 'EU Roaming (94 GB)', '9 Streaming tjenester', 'Ultimate'],
    color: '#ff8b4a',
    streamingCount: 9,
    roamingGB: 94
  },
  
  // CBB pakker
  {
    id: 'cbb-60',
    brand: 'CBB',
    name: '60 GB',
    dataGB: 60,
    unlimited: false,
    price: 109,
    earnings: 300,
    features: ['5G', 'EU Roaming'],
    color: '#a78bfa',
    roamingGB: 30
  },
  {
    id: 'cbb-200',
    brand: 'CBB',
    name: '200 GB',
    dataGB: 200,
    unlimited: false,
    price: 129,
    earnings: 500,
    features: ['5G', 'EU Roaming'],
    color: '#a78bfa',
    roamingGB: 30
  },
  {
    id: 'cbb-500',
    brand: 'CBB',
    name: '500 GB',
    dataGB: 500,
    unlimited: false,
    price: 149,
    earnings: 800,
    features: ['5G', 'EU Roaming'],
    color: '#a78bfa',
    roamingGB: 30
  },
  {
    id: 'cbb-500-offer',
    brand: 'CBB',
    name: '500 GB (Tilbud)',
    dataGB: 500,
    unlimited: false,
    price: 149,
    earnings: 800,
    features: ['5G', 'EU Roaming', 'Tilbud'],
    color: '#a78bfa',
    offer: true,
    expiry: '28/9',
    introPrice: 49,
    introMonths: 2,
    roamingGB: 30
  },
  {
    id: 'cbb-100',
    brand: 'CBB',
    name: '100 GB (World-data)',
    dataGB: 100,
    unlimited: false,
    price: 199,
    earnings: 800,
    features: ['5G', 'EU Roaming'],
    color: '#a78bfa',
    roamingGB: 40
  }
]

// Hjælpefunktioner til at finde abonnementer
export function getPlanById(id) {
  return PLANS.find(p => p.id === id)
}

export function getPlansByBrand(brand) {
  return PLANS.filter(p => p.brand === brand)
}

export function getStreamingPlans() {
  return PLANS.filter(p => 
    p.features.some(f => f.includes('Streaming')) ||
    p.streamingCount > 0
  )
}

export function getNonStreamingPlans() {
  return PLANS.filter(p => 
    !p.features.some(f => f.includes('Streaming')) &&
    !p.streamingCount
  )
}

