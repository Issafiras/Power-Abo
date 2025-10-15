// calc.js - Beregningsmotor med automatisk løsningsfinder

import { computeProviderBenefits, computeBaseMonthlyCost, PROVIDERS } from './providers.js'
import { computeStreamsTotal, STREAMING_SERVICES } from './streams.js'
import { PLANS, getStreamingPlans, getNonStreamingPlans } from './plans.js'

const MIN_SAVINGS = 500 // Minimum besparelse over 6 måneder

// Find den bedste løsning for kunden baseret på deres nuværende situation
export function findBestSolution(state) {
  const { household, streams, periodMonths } = state
  
  if (!household.size || !household.currentMonthlyPrice) {
    return null
  }
  
  // Beregn nuværende situation
  const selectedStreams = STREAMING_SERVICES.filter(s => streams[s.id])
  const currentStreamingMonthly = selectedStreams.reduce((sum, s) => sum + s.monthlyPrice, 0)
  const currentMonthly = household.currentMonthlyPrice
  const currentTotal = currentMonthly + currentStreamingMonthly
  const currentTotal6m = currentTotal * periodMonths
  
  // Find optimal løsning
  const optimalSolution = findOptimalSolution(
    household.size,
    currentMonthly,
    currentStreamingMonthly,
    selectedStreams.length
  )
  
  if (!optimalSolution) {
    return null
  }
  
  // Beregn totaler med intro-priser
  let our6m = 0
  if (optimalSolution.isFamilyPackage) {
    // Familie-pakke: 1 streaming + resten non-streaming
    our6m += calculate6MonthCost(optimalSolution.streamingPlan, 1)
    our6m += calculate6MonthCost(optimalSolution.nonStreamingPlan, household.size - 1)
    
    // Træk familierabat fra
    if (optimalSolution.familyDiscount) {
      our6m -= optimalSolution.familyDiscount * periodMonths
    }
  } else {
    // Enkelt plan for alle
    our6m = calculate6MonthCost(optimalSolution.plan, household.size)
  }
  
  const ourMonthly = our6m / periodMonths
  
  // Tilføj streaming hvis ikke inkluderet
  const hasStreamingIncluded = optimalSolution.plan?.features?.some(f => f.includes('Streaming')) ||
                                optimalSolution.streamingPlan?.features?.some(f => f.includes('Streaming'))
  
  const ourStreamingMonthly = hasStreamingIncluded ? 0 : currentStreamingMonthly
  const ourTotalMonthly = ourMonthly + ourStreamingMonthly
  const ourTotal6m = our6m + (ourStreamingMonthly * periodMonths)
  
  // Beregn besparelse
  const savingsMonthly = currentTotal - ourTotalMonthly
  const savingsTotal6m = currentTotal6m - ourTotal6m
  
  return {
    current: {
      monthly: currentTotal,
      mobileMonthly: currentMonthly,
      streamingMonthly: currentStreamingMonthly,
      total6m: currentTotal6m
    },
    recommended: {
      monthly: ourTotalMonthly,
      mobileBeforeDiscount: optimalSolution.basePrice,
      mobileAfterDiscount: optimalSolution.finalPrice,
      streamingMonthly: ourStreamingMonthly,
      total6m: ourTotal6m,
      discount: optimalSolution.discount || 0,
      planType: optimalSolution.name || optimalSolution.plan?.name,
      selectedStreams,
      plans: optimalSolution.isFamilyPackage ? 
        [optimalSolution.streamingPlan, optimalSolution.nonStreamingPlan] : 
        [optimalSolution.plan],
      details: optimalSolution
    },
    savings: {
      monthly: savingsMonthly,
      total6m: savingsTotal6m
    },
    provider: {
      id: optimalSolution.brand?.toLowerCase() || 'telenor',
      name: optimalSolution.brand || 'Telenor'
    },
    meetsMinSavings: savingsTotal6m >= MIN_SAVINGS,
    hasStreamingIncluded
  }
}

// Beregn 6-måneders omkostning med intro-priser
function calculate6MonthCost(plan, quantity) {
  if (!plan) return 0
  
  if (plan.introPrice && plan.introMonths) {
    const introTotal = plan.introPrice * plan.introMonths * quantity
    const remainingMonths = Math.max(0, 6 - plan.introMonths)
    const normalTotal = plan.price * remainingMonths * quantity
    return introTotal + normalTotal
  }
  
  return plan.price * 6 * quantity
}

// Find den optimale løsning baseret på antal personer og nuværende situation
function findOptimalSolution(familySize, currentMobile, currentStreaming, streamingCount) {
  let bestSolution = null
  let bestScore = -Infinity
  
  // Strategi 1: Telenor familie (1 streaming + resten standard)
  const telenorStreaming = PLANS.filter(p => 
    p.brand === 'Telenor' && 
    p.features.some(f => f.includes('Streaming'))
  )
  const telenorNonStreaming = PLANS.filter(p => 
    p.brand === 'Telenor' && 
    !p.features.some(f => f.includes('Streaming'))
  )
  
  if (telenorStreaming.length > 0 && telenorNonStreaming.length > 0 && familySize >= 2) {
    const streamPlan = telenorStreaming.sort((a, b) => (b.earnings || 0) - (a.earnings || 0))[0]
    const nonStreamPlan = telenorNonStreaming.sort((a, b) => 
      ((b.earnings || 0) / b.price) - ((a.earnings || 0) / a.price)
    )[0]
    
    const additionalPeople = familySize - 1
    const baseCost = streamPlan.price + (nonStreamPlan.price * additionalPeople)
    const familyDiscount = additionalPeople * 50 // Telenor familiepris
    const finalCost = baseCost - familyDiscount
    const totalEarnings = (streamPlan.earnings || 0) + (nonStreamPlan.earnings || 0) * additionalPeople
    
    const totalCurrentCost = currentMobile + currentStreaming
    const savings = totalCurrentCost - finalCost
    const score = calculateScore(savings, totalEarnings, true, true)
    
    if (score > bestScore) {
      bestScore = score
      bestSolution = {
        isFamilyPackage: true,
        brand: 'Telenor',
        name: `Familiepakke ${familySize} personer`,
        streamingPlan: streamPlan,
        nonStreamingPlan: nonStreamPlan,
        familySize,
        basePrice: baseCost,
        discount: familyDiscount,
        finalPrice: finalCost,
        earnings: totalEarnings,
        familyDiscount,
        isTelenorFamily: true
      }
    }
  }
  
  // Strategi 2: CBB MIX pakker (høj prioritet hvis kunde har streaming)
  const cbbMixPlans = PLANS.filter(p => p.cbbMix && p.streamingCount >= 2)
  for (const plan of cbbMixPlans) {
    const totalCost = plan.price * familySize
    const totalEarnings = (plan.earnings || 0) * familySize
    const totalCurrentCost = currentMobile + currentStreaming
    const savings = totalCurrentCost - totalCost
    
    // Ekstra bonus for CBB MIX hvis kunden har streaming
    let mixScore = calculateScore(savings, totalEarnings, false, true)
    if (streamingCount >= 2) {
      mixScore += 400 // Stor bonus for CBB MIX når kunde har streaming
    }
    
    if (mixScore > bestScore) {
      bestScore = mixScore
      bestSolution = {
        isFamilyPackage: false,
        plan,
        brand: plan.brand,
        name: plan.name,
        basePrice: totalCost,
        finalPrice: totalCost,
        earnings: totalEarnings,
        isCbbMix: true
      }
    }
  }
  
  // Strategi 3: Telmore streaming-pakker
  const telmoreStreamingPlans = PLANS.filter(p => 
    p.brand === 'Telmore' && 
    p.features.some(f => f.includes('Streaming'))
  )
  for (const plan of telmoreStreamingPlans) {
    const totalCost = plan.price * familySize
    const totalEarnings = (plan.earnings || 0) * familySize
    const totalCurrentCost = currentMobile + currentStreaming
    const savings = totalCurrentCost - totalCost
    const score = calculateScore(savings, totalEarnings, false, true)
    
    if (score > bestScore) {
      bestScore = score
      bestSolution = {
        isFamilyPackage: false,
        plan,
        brand: plan.brand,
        name: plan.name,
        basePrice: totalCost,
        finalPrice: totalCost,
        earnings: totalEarnings
      }
    }
  }
  
  // Strategi 4: Billigste non-streaming hvis kunden ikke har streaming
  if (streamingCount === 0) {
    const nonStreamingPlans = getNonStreamingPlans()
    for (const plan of nonStreamingPlans) {
      const totalCost = plan.price * familySize
      const totalEarnings = (plan.earnings || 0) * familySize
      const savings = currentMobile - totalCost
      const score = calculateScore(savings, totalEarnings, false, false)
      
      if (score > bestScore) {
        bestScore = score
        bestSolution = {
          isFamilyPackage: false,
          plan,
          brand: plan.brand,
          name: plan.name,
          basePrice: totalCost,
          finalPrice: totalCost,
          earnings: totalEarnings
        }
      }
    }
  }
  
  return bestSolution
}

// Intelligente anbefalinger baseret på kundens situation
export function getSmartRecommendations(state) {
  const { household, streams } = state
  const selectedStreams = STREAMING_SERVICES.filter(s => streams[s.id])
  const streamingCount = selectedStreams.length
  
  const recommendations = []
  
  // Anbefaling 1: CBB MIX hvis kunde har 2+ streaming-tjenester
  if (streamingCount >= 2) {
    const cbbMixSavings = selectedStreams.reduce((sum, s) => sum + s.monthlyPrice, 0)
    recommendations.push({
      type: 'cbb-mix',
      priority: 'high',
      title: 'CBB MIX - Spar på streaming!',
      description: `Du har ${streamingCount} streaming-tjenester. Med CBB MIX får du dem inkluderet!`,
      savings: `${cbbMixSavings} kr/md`,
      icon: '🎬',
      color: '#a78bfa'
    })
  }
  
  // Anbefaling 2: Telenor familie hvis 2+ personer
  if (household.size >= 2) {
    const familyDiscount = (household.size - 1) * 50
    recommendations.push({
      type: 'telenor-family',
      priority: 'high',
      title: 'Telenor Familiepris',
      description: `Med ${household.size} personer får I ${familyDiscount} kr/md rabat!`,
      savings: `${familyDiscount} kr/md`,
      icon: '👨‍👩‍👧‍👦',
      color: '#38bdf8'
    })
  }
  
  // Anbefaling 3: Telmore Play hvis mange streaming-tjenester
  if (streamingCount >= 3 && streamingCount <= 5) {
    recommendations.push({
      type: 'telmore-play',
      priority: 'medium',
      title: `Telmore Play ${streamingCount} tjenester`,
      description: `Perfekt match - få ${streamingCount} streaming-tjenester inkluderet!`,
      icon: '📺',
      color: '#ff8b4a'
    })
  }
  
  // Anbefaling 4: Budget-løsning
  const cheapestPlan = PLANS
    .filter(p => !p.cbbMix && !p.features.some(f => f.includes('Streaming')))
    .sort((a, b) => a.price - b.price)[0]
  
  if (cheapestPlan && streamingCount === 0) {
    recommendations.push({
      type: 'budget',
      priority: 'low',
      title: 'Budget-løsning',
      description: `Billigste: ${cheapestPlan.brand} ${cheapestPlan.name} - ${cheapestPlan.price} kr/md`,
      icon: '💰',
      color: '#22c55e'
    })
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Scorer løsninger baseret på besparelse + indtjening
function calculateScore(savings, earnings, isFamilyPackage, hasStreaming) {
  let score = earnings // Start med indtjening
  
  // Bonus for besparelse
  if (savings > 0) {
    score += savings * 2 // Besparelse tæller dobbelt
  } else if (savings >= -100) {
    score += savings * 0.5 // Mindre straf for lille merpris
  } else {
    return -Infinity // Afvis for dyre løsninger
  }
  
  // Bonus for familiepakker
  if (isFamilyPackage) {
    score += 200
  }
  
  // Bonus for streaming-inklusion
  if (hasStreaming) {
    score += 300
  }
  
  return score
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

