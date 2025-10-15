// providers.js - Telenor samlerabat og udbyderregler

// Telenor samlerabat tiers (eksempel data - juster efter behov)
const TELENOR_DISCOUNT_TIERS = [
  { minLines: 4, monthlyDiscount: 200, label: '4+ linjer' },
  { minLines: 3, monthlyDiscount: 150, label: '3 linjer' },
  { minLines: 2, monthlyDiscount: 100, label: '2 linjer' },
  { minLines: 1, monthlyDiscount: 0, label: '1 linje' }
]

export function computeProviderBenefits(state) {
  const { provider, household, periodMonths } = state
  
  if (provider !== 'telenor') {
    return {
      monthlyDiscount: 0,
      totalDiscount6m: 0,
      notes: []
    }
  }
  
  const lineCount = household.lines.length
  
  // Find relevant tier
  const tier = TELENOR_DISCOUNT_TIERS.find(t => lineCount >= t.minLines)
  
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
    notes: [`Telenor samlerabat: ${tier.label} → ${monthlyDiscount} kr/md`]
  }
}

// Hjælpefunktion til at beregne basis månedlig omkostning fra linjer
export function computeBaseMonthlyCost(lines) {
  return lines.reduce((sum, line) => sum + (line.monthlyPrice || 0), 0)
}

