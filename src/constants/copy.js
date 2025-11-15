/**
 * Centraliseret copy management
 * Alle tekster i applikationen for let vedligeholdelse og oversættelse
 */

export const COPY = {
  // Overskrifter - Forenklede og action-orienterede
  titles: {
    customerSituation: 'Hvad betaler du i dag?',
    customerSituationSubtitle: 'Vælg kundens nuværende streaming-tjenester og mobiludgifter',
    selectPlans: 'Find din perfekte pakke',
    selectPlansSubtitle: 'Vælg først operatør, derefter de abonnementer, som passer bedst til kunden',
    quickSolution: 'Få din løsning nu',
    quickSolutionSubtitle: 'Klik på knappen nedenfor, så finder systemet automatisk den bedste kombination af abonnementer',
    comparison: 'Sammenligning',
    comparisonSubtitle: '6-måneders analyse'
  },

  // Labels
  labels: {
    numberOfLines: 'Antal mobilabonnementer',
    existingBrands: 'Har kunden allerede abonnement hos?',
    existingBrandsHelp: 'Vælg brands, som kunden allerede har – disse vil blive ekskluderet fra automatisk løsning',
    mobileCost: 'Nuværende månedlige mobiludgifter',
    originalItemPrice: 'Varens pris inden rabat og besparelse',
    eanSearch: 'Søg vare efter navn, EAN eller mærke',
    streaming: 'Vælg streaming-tjenester',
    selectProvider: 'Vælg en operatør',
    selectProviderHelp: 'Vælg Telmore, Telenor, CBB eller Bredbånd for at se tilgængelige abonnementer',
    noPlansFound: 'Ingen abonnementer fundet',
    noPlansFoundHelp: 'Prøv at ændre søgeordet',
    customerColumn: 'Kunden',
    offerColumn: 'Vores Tilbud',
    savings: 'Besparelse',
    mersalg: 'Mersalg',
    over6Months: 'over 6 måneder'
  },

  // CTA knapper
  cta: {
    addToCart: 'Vælg denne pakke',
    findBestSolution: 'Se min besparelse',
    addToCartOriginal: 'Tilføj til kurv',
    findBestSolutionOriginal: 'Find Bedste Løsning Nu',
    selectProvider: 'Vælg en operatør',
    search: 'Søg',
    scan: 'Scan',
    scanBarcode: 'Scan stregkode',
    cancel: 'Annullér',
    close: 'Luk',
    togglePresentation: 'Præsentér',
    toggleTheme: 'Skift tema',
    reset: 'Nulstil',
    next: 'Næste',
    back: 'Tilbage',
    print: 'Print',
    nextCustomer: 'Næste kunde'
  },

  // Success meddelelser - Empatisk tone
  success: {
    addedToCart: (name) => `Godt valg! ${name} er tilføjet til kurven`,
    updatedInCart: (name) => `${name} opdateret i kurven`,
    removedFromCart: (name) => `${name} fjernet fra kurven`,
    foundSolution: (explanation) => `Godt valg! ${explanation}`,
    reset: 'Alt nulstillet',
    saved: 'Gemt',
    searchSuccess: (title, price) => `Fundet: ${title} - ${price} kr`,
    priceFound: (price) => `Pris fundet: ${price} kr (via filter)`
  },

  // Error meddelelser - Actionable
  error: {
    noSolution: 'Ups, vi kunne ikke finde en match. Lad os justere...',
    noProductsFound: 'Ingen produkter fundet for denne søgeterm',
    searchFailed: (message) => `Fejl ved søgning: ${message}`,
    couldNotFindSolution: 'Kunne ikke finde en løsning. Prøv at tilføje streaming-tjenester eller mobiludgifter.',
    scannerAccess: 'Kunne ikke få adgang til kamera. Tjek tilladelser.',
    scannerUnsupported: 'Din browser understøtter ikke indbygget stregkodescanning. Brug manuel søgning i stedet.',
    validation: (field, message) => `${field}: ${message}`
  },

  // Help tekster - Kortere med bullet points
  help: {
    searchPlaceholder: 'F.eks. iPhone, Samsung, 4894526079567',
    searchHelp: 'Søg efter produktnavn, mærke, EAN-kode eller beskrivelse',
    activateAutoSelect: 'Vælg mindst én streaming-tjeneste nedenfor eller indtast mobiludgifter for at aktivere',
    totalHelp: 'Gennemsnit pr. abonnement:',
    perMonth: 'pr. måned',
    perMonthShort: 'pr. md.',
    sixMonths: '6 måneder',
    sixMonthTotal: '6-måneders total'
  },

  // Features
  features: {
    cashDiscount: 'Kontant Rabat',
    cashDiscountLocked: 'Låst',
    autoAdjust: 'Auto-justér (sælger-strategi)',
    freeSetup: 'Gratis oprettelse',
    streamingStatus: 'Streaming Status',
    included: (count) => `${count} tjeneste${count !== 1 ? 'r' : ''} inkluderet`,
    notIncluded: (count, cost) => `${count} tjeneste${count !== 1 ? 'r' : ''} tillæg (${cost}/md.)`,
    earnings: 'Indtjening',
    netto: 'Netto'
  },

  // Keyboard shortcuts
  shortcuts: {
    reset: 'Ctrl+R',
    presentation: 'Ctrl+P',
    theme: 'Ctrl+T',
    earnings: 'F8',
    skipToContent: 'Spring til hovedindhold'
  },

  // Presentation mode
  presentation: {
    title: 'Præsentation',
    close: 'Luk præsentation',
    print: 'Print tilbud',
    nextCustomer: 'Næste kunde',
    keyboardShortcut: "Tryk 'P' for at toggle præsentation"
  },

  // Social proof
  socialProof: {
    basedOn: 'Baseret på 500+ kunder med lignende behov',
    whyThisSolution: 'Hvorfor denne løsning?',
    whyReasons: {
      includesStreaming: (count) => `Omfatter alle dine valgte ${count} streaming-tjeneste${count !== 1 ? 'r' : ''}`,
      dataFits: (gb) => `${gb} GB data passer til dit forbrug`,
      saves: (amount) => `Du sparer ${amount} kr. over 6 måneder`,
      features: '5G hastighed og EU roaming inkluderet'
    }
  },

  // Empty states
  empty: {
    noCartItems: 'Tilføj abonnementer for at se sammenligning',
    noData: 'Ingen data at sammenligne endnu',
    noStreaming: 'Vælg streaming-tjenester nedenfor',
    noMobileCost: 'Indtast mobiludgifter ovenfor'
  }
};

export default COPY;

