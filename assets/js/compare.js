// compare.js - Sammenligning af multiple løsninger

import { PLANS } from './plans.js'
import { STREAMING_SERVICES } from './streams.js'
import { computeProviderBenefits } from './providers.js'

// Find top 3 løsninger for kunden
export function findTopSolutions(householdSize, currentMobile, currentStreaming, streamingCount) {
  const allSolutions = []
  
  // Evaluer alle mulige løsninger
  const allProviders = ['Telenor', 'Telmore', 'CBB']
  
  for (const provider of allProviders) {
    const providerPlans = PLANS.filter(p => p.brand === provider)
    
    for (const plan of providerPlans) {
      const solution = evaluateSolution(plan, householdSize, currentMobile, currentStreaming, streamingCount)
      if (solution) {
        allSolutions.push(solution)
      }
    }
  }
  
  // Tilføj også familie-kombinationer
  const familySolutions = generateFamilyCombinations(householdSize, currentMobile, currentStreaming)
  allSolutions.push(...familySolutions)
  
  // Sorter efter score og returner top 3
  return allSolutions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function evaluateSolution(plan, familySize, currentMobile, currentStreaming, streamingCount) {
  const totalCost = calculateTotalCost(plan, familySize)
  const hasStreaming = plan.features?.some(f => f.includes('Streaming')) || plan.streamingCount > 0
  
  // Beregn faktisk total (inkl. streaming hvis ikke inkluderet)
  const actualTotal = hasStreaming ? totalCost : totalCost + currentStreaming
  const currentTotal = currentMobile + currentStreaming
  
  const savings = currentTotal - actualTotal
  const earnings = (plan.earnings || 0) * familySize
  
  // Score-beregning
  let score = earnings
  
  if (savings > 0) {
    score += savings * 2
  } else if (savings > -100) {
    score += savings * 0.5
  } else {
    return null // Skip dyre løsninger
  }
  
  // Bonus for streaming match
  if (streamingCount >= 2 && hasStreaming) {
    score += 400
  }
  
  // Bonus for CBB MIX
  if (plan.cbbMix) {
    score += 300
  }
  
  return {
    plan,
    provider: plan.brand,
    totalMonthly: actualTotal / familySize,
    total6m: actualTotal * 6,
    savings6m: savings * 6,
    savingsMonthly: savings,
    earnings,
    score,
    hasStreaming,
    familySize,
    type: 'single'
  }
}

function calculateTotalCost(plan, familySize) {
  if (plan.introPrice && plan.introMonths) {
    const introTotal = plan.introPrice * plan.introMonths * familySize
    const normalMonths = 6 - plan.introMonths
    const normalTotal = plan.price * normalMonths * familySize
    return (introTotal + normalTotal) / 6 // Gennemsnit per måned
  }
  return plan.price * familySize
}

function generateFamilyCombinations(familySize, currentMobile, currentStreaming) {
  if (familySize < 2) return []
  
  const solutions = []
  
  // Telenor familie: 1 streaming + resten standard
  const telenorStreaming = PLANS.filter(p => 
    p.brand === 'Telenor' && p.features?.some(f => f.includes('Streaming'))
  ).sort((a, b) => (b.earnings || 0) - (a.earnings || 0))[0]
  
  const telenorStandard = PLANS.filter(p => 
    p.brand === 'Telenor' && !p.features?.some(f => f.includes('Streaming'))
  ).sort((a, b) => ((b.earnings || 0) / b.price) - ((a.earnings || 0) / a.price))[0]
  
  if (telenorStreaming && telenorStandard) {
    const baseCost = telenorStreaming.price + (telenorStandard.price * (familySize - 1))
    const familyDiscount = (familySize - 1) * 50
    const totalMonthly = baseCost - familyDiscount
    const currentTotal = currentMobile + currentStreaming
    const savings = currentTotal - totalMonthly
    const earnings = (telenorStreaming.earnings || 0) + (telenorStandard.earnings || 0) * (familySize - 1)
    
    let score = earnings + (savings > 0 ? savings * 2 : savings * 0.5) + 500 // Familie-bonus
    
    solutions.push({
      provider: 'Telenor',
      totalMonthly,
      total6m: totalMonthly * 6,
      savings6m: savings * 6,
      savingsMonthly: savings,
      earnings,
      score,
      hasStreaming: true,
      familySize,
      type: 'family',
      streamingPlan: telenorStreaming,
      standardPlan: telenorStandard,
      familyDiscount
    })
  }
  
  return solutions
}

// Sammenlign 3 udbydere side-om-side
export function compareProviders(householdSize, currentMobile, selectedStreams) {
  const providers = [
    { id: 'telenor', name: 'Telenor', color: '#38bdf8' },
    { id: 'telmore', name: 'Telmore', color: '#ff8b4a' },
    { id: 'cbb', name: 'CBB', color: '#a78bfa' }
  ]
  
  const streamingCount = selectedStreams.length
  const currentStreaming = selectedStreams.reduce((sum, s) => sum + s.monthlyPrice, 0)
  
  return providers.map(provider => {
    const providerPlans = PLANS.filter(p => p.brand === provider.name)
    
    // Find bedste plan for denne udbyder
    let bestPlan = null
    let bestScore = -Infinity
    
    for (const plan of providerPlans) {
      const solution = evaluateSolution(plan, householdSize, currentMobile, currentStreaming, streamingCount)
      if (solution && solution.score > bestScore) {
        bestScore = solution.score
        bestPlan = solution
      }
    }
    
    return {
      provider: provider.name,
      color: provider.color,
      solution: bestPlan,
      rank: 0 // Vil blive sat senere
    }
  })
  .filter(p => p.solution !== null)
  .sort((a, b) => b.solution.score - a.solution.score)
  .map((p, idx) => ({ ...p, rank: idx + 1 }))
}

