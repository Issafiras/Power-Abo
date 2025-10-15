// charts.js - Visualiseringer og grafer

// Generer sammenligning chart (SVG bar chart)
export function generateComparisonChart(currentTotal, recommendedTotal, savingsTotal) {
  const maxValue = Math.max(currentTotal, recommendedTotal)
  const currentHeight = (currentTotal / maxValue) * 100
  const recommendedHeight = (recommendedTotal / maxValue) * 100
  
  return `
    <svg class="comparison-chart" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Current bar -->
      <g class="chart-bar">
        <rect x="40" y="${200 - currentHeight * 1.5}" width="60" height="${currentHeight * 1.5}" 
              fill="url(#gradient-bad)" rx="4"/>
        <text x="70" y="${200 - currentHeight * 1.5 - 10}" 
              text-anchor="middle" fill="var(--text-primary)" font-size="12" font-weight="600">
          ${currentTotal.toLocaleString('da-DK')} kr
        </text>
        <text x="70" y="195" text-anchor="middle" fill="var(--muted)" font-size="11">
          I dag
        </text>
      </g>
      
      <!-- Recommended bar -->
      <g class="chart-bar">
        <rect x="120" y="${200 - recommendedHeight * 1.5}" width="60" height="${recommendedHeight * 1.5}" 
              fill="url(#gradient-good)" rx="4"/>
        <text x="150" y="${200 - recommendedHeight * 1.5 - 10}" 
              text-anchor="middle" fill="var(--text-primary)" font-size="12" font-weight="600">
          ${recommendedTotal.toLocaleString('da-DK')} kr
        </text>
        <text x="150" y="195" text-anchor="middle" fill="var(--muted)" font-size="11">
          Vores
        </text>
      </g>
      
      <!-- Savings bar -->
      ${savingsTotal > 0 ? `
        <g class="chart-bar">
          <rect x="200" y="${200 - (savingsTotal / maxValue * 100) * 1.5}" width="60" height="${(savingsTotal / maxValue * 100) * 1.5}" 
                fill="url(#gradient-savings)" rx="4"/>
          <text x="230" y="${200 - (savingsTotal / maxValue * 100) * 1.5 - 10}" 
                text-anchor="middle" fill="var(--good)" font-size="12" font-weight="700">
            ${savingsTotal.toLocaleString('da-DK')} kr
          </text>
          <text x="230" y="195" text-anchor="middle" fill="var(--good)" font-size="11" font-weight="600">
            Besparelse
          </text>
        </g>
      ` : ''}
      
      <!-- Gradients -->
      <defs>
        <linearGradient id="gradient-bad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gradient-good" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="gradient-savings" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  `
}

// Generer månedlig trend chart
export function generateMonthlyTrendChart(currentMonthly, recommendedMonthly) {
  const months = ['Mdr 1', 'Mdr 2', 'Mdr 3', 'Mdr 4', 'Mdr 5', 'Mdr 6']
  const maxValue = Math.max(currentMonthly, recommendedMonthly) * 1.2
  
  // Generer punkter for nuværende og anbefalet
  const currentPoints = months.map((_, i) => {
    const x = 40 + (i * 40)
    const y = 160 - (currentMonthly / maxValue * 120)
    return { x, y, value: currentMonthly }
  })
  
  const recommendedPoints = months.map((_, i) => {
    const x = 40 + (i * 40)
    const y = 160 - (recommendedMonthly / maxValue * 120)
    return { x, y, value: recommendedMonthly }
  })
  
  const currentPath = currentPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')
  
  const recommendedPath = recommendedPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')
  
  return `
    <svg class="trend-chart" viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid lines -->
      <line x1="30" y1="40" x2="260" y2="40" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <line x1="30" y1="100" x2="260" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <line x1="30" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      
      <!-- Current trend line -->
      <path d="${currentPath}" fill="none" stroke="#ef4444" stroke-width="3" 
            stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
      ${currentPoints.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ef4444"/>
      `).join('')}
      
      <!-- Recommended trend line -->
      <path d="${recommendedPath}" fill="none" stroke="#10b981" stroke-width="3" 
            stroke-linecap="round" stroke-linejoin="round"/>
      ${recommendedPoints.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#10b981"/>
      `).join('')}
      
      <!-- Labels -->
      ${months.map((label, i) => `
        <text x="${40 + (i * 40)}" y="175" text-anchor="middle" fill="var(--muted)" font-size="9">
          ${label}
        </text>
      `).join('')}
      
      <!-- Legend -->
      <g transform="translate(10, 10)">
        <circle cx="5" cy="5" r="4" fill="#ef4444"/>
        <text x="15" y="9" fill="var(--text-secondary)" font-size="10">I dag</text>
        
        <circle cx="60" cy="5" r="4" fill="#10b981"/>
        <text x="70" y="9" fill="var(--text-secondary)" font-size="10">Vores</text>
      </g>
    </svg>
  `
}

// Generer cirkel-graf for besparelse breakdown
export function generateSavingsBreakdown(mobileSavings, streamingSavings, discountSavings) {
  const total = mobileSavings + streamingSavings + discountSavings
  
  if (total === 0) {
    return '<div style="text-align: center; padding: 2rem; color: var(--muted);">Ingen besparelse endnu</div>'
  }
  
  const mobilePercent = (mobileSavings / total) * 100
  const streamingPercent = (streamingSavings / total) * 100
  const discountPercent = (discountSavings / total) * 100
  
  let currentAngle = 0
  const slices = []
  
  if (mobileSavings > 0) {
    slices.push({
      percent: mobilePercent,
      angle: (mobilePercent / 100) * 360,
      startAngle: currentAngle,
      color: '#3b82f6',
      label: 'Mobil',
      value: mobileSavings
    })
    currentAngle += (mobilePercent / 100) * 360
  }
  
  if (streamingSavings > 0) {
    slices.push({
      percent: streamingPercent,
      angle: (streamingPercent / 100) * 360,
      startAngle: currentAngle,
      color: '#8b5cf6',
      label: 'Streaming',
      value: streamingSavings
    })
    currentAngle += (streamingPercent / 100) * 360
  }
  
  if (discountSavings > 0) {
    slices.push({
      percent: discountPercent,
      angle: (discountPercent / 100) * 360,
      startAngle: currentAngle,
      color: '#10b981',
      label: 'Rabat',
      value: discountSavings
    })
  }
  
  return `
    <div class="pie-chart-container">
      <svg class="pie-chart" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="var(--bg-tertiary)"/>
        ${slices.map(slice => {
          const startAngle = (slice.startAngle - 90) * Math.PI / 180
          const endAngle = ((slice.startAngle + slice.angle) - 90) * Math.PI / 180
          const x1 = 100 + 80 * Math.cos(startAngle)
          const y1 = 100 + 80 * Math.sin(startAngle)
          const x2 = 100 + 80 * Math.cos(endAngle)
          const y2 = 100 + 80 * Math.sin(endAngle)
          const largeArc = slice.angle > 180 ? 1 : 0
          
          return `
            <path d="M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z" 
                  fill="${slice.color}" opacity="0.9"/>
          `
        }).join('')}
        
        <!-- Center circle -->
        <circle cx="100" cy="100" r="50" fill="var(--bg-secondary)"/>
        <text x="100" y="95" text-anchor="middle" fill="var(--text-primary)" font-size="16" font-weight="700">
          ${total.toLocaleString('da-DK')}
        </text>
        <text x="100" y="110" text-anchor="middle" fill="var(--muted)" font-size="10">
          kr sparet
        </text>
      </svg>
      
      <div class="pie-legend">
        ${slices.map(slice => `
          <div class="legend-item">
            <div class="legend-color" style="background: ${slice.color}"></div>
            <div class="legend-label">${slice.label}</div>
            <div class="legend-value">${slice.value.toLocaleString('da-DK')} kr (${slice.percent.toFixed(0)}%)</div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

