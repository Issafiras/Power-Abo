// calc.js - Beregningsmotor med minimum 500 kr besparelsesregel

import { computeProviderBenefits, computeBaseMonthlyCost } from './providers.js'
import { computeStreamsTotal } from './streams.js'

const MIN_SAVINGS = 500 // Minimum besparelse over 6 måneder

export function calculateAll(state) {
  const { periodMonths, household } = state
  
  // 1) Beregn basis mobil-omkostninger
  const baseMonthlyCost = computeBaseMonthlyCost(household.lines)
  const baseTotal6m = baseMonthlyCost * periodMonths
  
  // 2) Beregn provider-rabatter (Telenor samlerabat)
  const providerBenefits = computeProviderBenefits(state)
  const { totalDiscount6m, monthlyDiscount } = providerBenefits
  
  // 3) Beregn streaming-omkostninger
  const streamsData = computeStreamsTotal(state)
  const { total6m: streamsTotal6m, monthlyTotal: streamsMonthlyCost } = streamsData
  
  // 4) Total efter rabatter
  const totalAfterDiscount6m = baseTotal6m - totalDiscount6m
  const total6mWithStreams = totalAfterDiscount6m + streamsTotal6m
  
  // 5) Samlet besparelse (sammenlignet med ingen rabat)
  const savings6m = totalDiscount6m
  
  // 6) Tjek om minimum 500 kr besparelse er nået
  const meetsMinSavings = savings6m >= MIN_SAVINGS
  
  // 7) Generer forslag hvis ikke opfyldt
  const suggestions = []
  if (!meetsMinSavings && household.lines.length > 0) {
    const deficit = MIN_SAVINGS - savings6m
    suggestions.push(`Du mangler ${deficit} kr i besparelse for at nå minimum 500 kr`)
    
    if (household.lines.length < 2) {
      suggestions.push('Tilføj flere linjer for at opnå højere samlerabat')
    }
    
    if (streamsData.selected.length > 3) {
      suggestions.push('Overvej at reducere antal streaming-tjenester')
    }
    
    if (monthlyDiscount === 0) {
      const providerName = providerBenefits.providerName || state.provider
      suggestions.push(`${providerName} samlerabat kræver mindst 2 linjer`)
    }
  }
  
  return {
    baseMonthlyCost,
    baseTotal6m,
    providerBenefits,
    streamsData,
    totalAfterDiscount6m,
    total6mWithStreams,
    savings6m,
    meetsMinSavings,
    suggestions,
    summary: {
      monthlyBeforeDiscount: baseMonthlyCost,
      monthlyDiscount,
      monthlyAfterDiscount: baseMonthlyCost - monthlyDiscount,
      monthlyStreams: streamsMonthlyCost,
      monthlyTotal: baseMonthlyCost - monthlyDiscount + streamsMonthlyCost,
      total6m: total6mWithStreams,
      totalSavings6m: savings6m
    }
  }
}

