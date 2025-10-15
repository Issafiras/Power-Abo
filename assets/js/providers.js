// providers.js - Udbyder-rabatter for Telenor, Telmore og CBB

// Telenor samlerabat tiers
const TELENOR_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 200, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 150, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 100, label: '2 linjer' },
  { minLines: 1, monthlyDiscount: 0, label: '1 linje' }
]

// Telmore samlerabat tiers
const TELMORE_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 180, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 130, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 80, label: '2 linjer' },
  { minLines: 1, monthlyDiscount: 0, label: '1 linje' }
]

// CBB samlerabat tiers
const CBB_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 160, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 120, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 70, label: '2 linjer' },
  { minLines: 1, monthlyDiscount: 0, label: '1 linje' }
]

// Provider metadata
export const PROVIDERS = [
  { id: 'telenor', label: 'Telenor', color: '#0ea5e9' },
  { id: 'telmore', label: 'Telmore', color: '#10b981' },
  { id: 'cbb', label: 'CBB', color: '#8b5cf6' }
]

export function computeProviderBenefits(state) {
  const { provider, household, periodMonths } = state
  const lineCount = household.lines.length
  
  // Vælg relevante tiers baseret på udbyder
  let tiers
  let providerName
  
  if (provider === 'telenor') {
    tiers = TELENOR_DISCOUNT_TIERS
    providerName = 'Telenor'
  } else if (provider === 'telmore') {
    tiers = TELMORE_DISCOUNT_TIERS
    providerName = 'Telmore'
  } else if (provider === 'cbb') {
    tiers = CBB_DISCOUNT_TIERS
    providerName = 'CBB'
  } else {
    return {
      monthlyDiscount: 0,
      totalDiscount6m: 0,
      notes: ['Ukendt udbyder']
    }
  }
  
  // Find relevant tier
  const tier = tiers.find(t => lineCount >= t.minLines)
  
  if (!tier || tier.monthlyDiscount === 0) {
    return {
      monthlyDiscount: 0,
      totalDiscount6m: 0,
      notes: ['Ingen samlerabat - tilføj flere linjer for rabat']
    }
  }
  
  const monthlyDiscount = tier.monthlyDiscount
  const totalDiscount6m = monthlyDiscount * periodMonths
  
  return {
    monthlyDiscount,
    totalDiscount6m,
    tier: tier.label,
    providerName,
    notes: [`${providerName} samlerabat: ${tier.label} → ${monthlyDiscount} kr/md`]
  }
}

// Hjælpefunktion til at beregne basis månedlig omkostning fra linjer
export function computeBaseMonthlyCost(lines) {
  return lines.reduce((sum, line) => sum + (line.monthlyPrice || 0), 0)
}

