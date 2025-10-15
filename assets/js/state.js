// state.js - Simpel state management for 6-måneders familieløsning

let appState = {
  provider: 'telenor',
  periodMonths: 6,
  household: {
    size: 1, // Antal personer i husstanden
    currentMonthlyPrice: 0, // Hvad de betaler nu for mobil
    lines: [] // Legacy: bruges ikke i ny version
  },
  streams: {} // { serviceId: true/false }
}

export function getState() {
  return appState
}

export function setState(patch) {
  appState = { ...appState, ...patch }
  if (patch.household) {
    appState.household = { ...appState.household, ...patch.household }
  }
  if (patch.streams) {
    appState.streams = { ...appState.streams, ...patch.streams }
  }
}

export function reset() {
  appState = {
    provider: 'telenor',
    periodMonths: 6,
    household: {
      size: 1,
      currentMonthlyPrice: 0,
      lines: []
    },
    streams: {}
  }
}

export function toShareLink() {
  const params = new URLSearchParams()
  params.set('provider', appState.provider)
  params.set('months', appState.periodMonths)
  
  if (appState.household.lines.length > 0) {
    params.set('lines', JSON.stringify(appState.household.lines))
  }
  
  if (Object.keys(appState.streams).length > 0) {
    params.set('streams', JSON.stringify(appState.streams))
  }
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

export function fromShareLink() {
  const params = new URLSearchParams(window.location.search)
  
  if (!params.has('provider')) {
    return false
  }
  
  const provider = params.get('provider') || 'telenor'
  const periodMonths = parseInt(params.get('months') || '6', 10)
  
  let lines = []
  if (params.has('lines')) {
    try {
      lines = JSON.parse(params.get('lines'))
    } catch (e) {
      console.warn('Kunne ikke parse lines fra URL')
    }
  }
  
  let streams = {}
  if (params.has('streams')) {
    try {
      streams = JSON.parse(params.get('streams'))
    } catch (e) {
      console.warn('Kunne ikke parse streams fra URL')
    }
  }
  
  appState = {
    provider,
    periodMonths,
    household: { lines },
    streams
  }
  
  return true
}

