// streams.js - Streaming tjenester med priser og ikoner (fra v9.0)

export const STREAMING_SERVICES = [
  {
    id: 'netflix',
    label: 'Netflix',
    monthlyPrice: 139,
    icon: '🎬',
    color: '#e50914'
  },
  {
    id: 'viaplay',
    label: 'Viaplay',
    monthlyPrice: 149,
    icon: '🎯',
    color: '#00d4aa'
  },
  {
    id: 'hbo',
    label: 'HBO Max',
    monthlyPrice: 119,
    icon: '🎭',
    color: '#673ab7'
  },
  {
    id: 'tv2play',
    label: 'TV2 Play',
    monthlyPrice: 99,
    icon: '📺',
    color: '#ff6b35'
  },
  {
    id: 'saxo',
    label: 'Saxo',
    monthlyPrice: 79,
    icon: '📖',
    color: '#c41e3a'
  },
  {
    id: 'disney',
    label: 'Disney+',
    monthlyPrice: 129,
    icon: '✨',
    color: '#0066cc'
  },
  {
    id: 'skyshowtime',
    label: 'SkyShowtime',
    monthlyPrice: 89,
    icon: '⭐',
    color: '#6b46c1'
  },
  {
    id: 'prime',
    label: 'Prime Video',
    monthlyPrice: 59,
    icon: '🎥',
    color: '#0f7ae5'
  },
  {
    id: 'musik',
    label: 'Musik tjeneste',
    monthlyPrice: 109,
    icon: '🎵',
    color: '#1e40af'
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

