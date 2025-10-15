// calc.js - Beregningsmotor med automatisk løsningsfinder

import { computeProviderBenefits, computeBaseMonthlyCost, PROVIDERS } from './providers.js'
import { computeStreamsTotal, STREAMING_SERVICES } from './streams.js'

const MIN_SAVINGS = 500 // Minimum besparelse over 6 måneder

// Standardpriser for abonnementer baseret på husstandsstørrelse
const PLAN_PRICING = {
  1: { price: 299, type: 'Standard (50 GB)' },
  2: { price: 299, type: 'Standard (50 GB)' },
  3: { price: 299, type: 'Standard (50 GB)' },
  4: { price: 299, type: 'Standard (50 GB)' },
  default: { price: 299, type: 'Standard (50 GB)' }
}

// Find den bedste løsning for kunden baseret på deres nuværende situation
export function findBestSolution(state) {
  const { household, streams, periodMonths } = state
  
  if (!household.size || !household.currentMonthlyPrice) {
    return null
  }
  
  // Beregn nuværende situation
  const selectedStreams = STREAMING_SERVICES.filter(s => streams[s.id])
  const currentStreamingMonthly = selectedStreams.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const currentMonthly = household.currentMonthlyPrice + currentStreamingMonthly
  const currentTotal6m = currentMonthly * periodMonths
  
  // Find bedste udbyder (den med højest rabat)
  const providers = ['telenor', 'telmore', 'cbb']
  let bestProvider = null
  let bestSavings = -Infinity
  
  for (const providerId of providers) {
    const tempState = {
      ...state,
      provider: providerId,
      household: {
        ...household,
        lines: Array(household.size).fill({ monthlyPrice: 299 })
      }
    }
    
    const benefits = computeProviderBenefits(tempState)
    const savings = benefits.monthlyDiscount
    
    if (savings > bestSavings) {
      bestSavings = savings
      bestProvider = {
        id: providerId,
        name: benefits.providerName,
        discount: savings,
        tier: benefits.tier
      }
    }
  }
  
  // Beregn vores anbefalede løsning
  const plan = PLAN_PRICING[household.size] || PLAN_PRICING.default
  const mobileBeforeDiscount = plan.price * household.size
  const mobileAfterDiscount = mobileBeforeDiscount - bestProvider.discount
  const recommendedMonthly = mobileAfterDiscount + currentStreamingMonthly
  const recommendedTotal6m = recommendedMonthly * periodMonths
  
  // Beregn besparelse
  const savingsMonthly = currentMonthly - recommendedMonthly
  const savingsTotal6m = currentTotal6m - recommendedTotal6m
  
  return {
    current: {
      monthly: currentMonthly,
      streamingMonthly: currentStreamingMonthly,
      total6m: currentTotal6m
    },
    recommended: {
      monthly: recommendedMonthly,
      mobileBeforeDiscount,
      mobileAfterDiscount,
      streamingMonthly: currentStreamingMonthly,
      total6m: recommendedTotal6m,
      discount: bestProvider.discount,
      planType: plan.type,
      selectedStreams
    },
    savings: {
      monthly: savingsMonthly,
      total6m: savingsTotal6m
    },
    provider: bestProvider,
    meetsMinSavings: savingsTotal6m >= MIN_SAVINGS
  }
}

// Legacy funktion - bruges ikke længere
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

