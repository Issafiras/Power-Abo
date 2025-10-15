// streams.js - Streaming tjenester med priser og ikoner

export const STREAMING_SERVICES = [
  {
    id: 'netflix',
    label: 'Netflix',
    monthlyPrice: 119,
    icon: '🎬',
    color: '#e50914'
  },
  {
    id: 'hbo',
    label: 'HBO Max',
    monthlyPrice: 79,
    icon: '🎭',
    color: '#7c3aed'
  },
  {
    id: 'tv2play',
    label: 'TV2 Play',
    monthlyPrice: 89,
    icon: '📺',
    color: '#0ea5e9'
  },
  {
    id: 'viaplay',
    label: 'Viaplay',
    monthlyPrice: 109,
    icon: '🎯',
    color: '#10b981'
  },
  {
    id: 'disney',
    label: 'Disney+',
    monthlyPrice: 89,
    icon: '✨',
    color: '#3b82f6'
  },
  {
    id: 'skyshowtime',
    label: 'SkyShowtime',
    monthlyPrice: 69,
    icon: '⭐',
    color: '#8b5cf6'
  },
  {
    id: 'prime',
    label: 'Prime Video',
    monthlyPrice: 69,
    icon: '🎥',
    color: '#14b8a6'
  },
  {
    id: 'musik',
    label: 'Musik (Spotify/etc)',
    monthlyPrice: 99,
    icon: '🎵',
    color: '#22c55e'
  }
]

export function computeStreamsTotal(state) {
  const { streams, periodMonths } = state
  
  let monthlyTotal = 0
  const selected = []
  
  for (const service of STREAMING_SERVICES) {
    const count = streams[service.id] || 0
    if (count > 0) {
      const serviceCost = service.monthlyPrice * count
      monthlyTotal += serviceCost
      selected.push({
        ...service,
        count,
        monthlyCost: serviceCost
      })
    }
  }
  
  const total6m = monthlyTotal * periodMonths
  
  return {
    monthlyTotal,
    total6m,
    selected
  }
}

