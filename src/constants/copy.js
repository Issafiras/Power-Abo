/**
 * Centraliseret copy management
 * Alle tekster i applikationen for let vedligeholdelse og oversættelse
 */

export const COPY = {
  // Overskrifter - Forenklede og action-orienterede
  titles: {
    customerSituation: 'Hvad betaler du i dag?',
    customerSituationSubtitle: 'Vælg kundens nuværende streaming-tjenester, mobil- og bredbåndsudgifter',
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
    broadbandCost: 'Nuværende månedlige bredbåndsudgifter',
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
    help: 'Hjælp',
    closeHelp: 'Luk hjælp',
    close: 'Luk',
    togglePresentation: 'Præsentér',
    toggleTheme: 'Skift tema',
    reset: 'Nulstil',
    next: 'Næste',
    back: 'Tilbage',
    print: 'Print',
    nextCustomer: 'Næste kunde'
  },

  // Success meddelelser - Salgsorienterede og empatiske
  success: {
    addedToCart: (name) => `Perfekt valg! ${name} er nu i din løsning`,
    updatedInCart: (name) => `Opdateret! ${name} justeret efter dine behov`,
    removedFromCart: (name) => `${name} fjernet - vi finder noget bedre`,
    foundSolution: (explanation) => `Fantastisk løsning fundet! ${explanation}`,
    reset: 'Klar til næste kunde - alt nulstillet',
    saved: 'Løsningen er gemt til senere',
    searchSuccess: (title, price) => `Produkt fundet! ${title} til kun ${price} kr`,
    priceFound: (price) => `Pris bekræftet: ${price} kr - god besparelse!`,
    autoSelectedPlan: (name, price, savings) => `Automatisk valgt: ${name} (${price} kr/md) - sparer ${savings} kr`,
    streamingAdded: (name) => `${name} tilføjet til din underholdningspakke`,
    streamingRemoved: (name) => `${name} fjernet fra pakken`,
    customerDataSaved: 'Kundens situation gemt - klar til næste trin',
    presentationReady: 'Præsentation er klar - imponer kunden!',
    calculationComplete: 'Beregning færdig - se den fantastiske besparelse!',
    discountApplied: (amount) => `Rabat på ${amount} kr anvendt - endnu bedre tilbud!`,
    familyDiscountActive: (lines, savings) => `Familierabat aktiveret: ${lines} linjer sparer ${savings} kr/md`,
    streamingBundleActive: (count, savings) => `Streaming-pakke aktiveret: ${count} tjenester sparer ${savings} kr/md`
  },

  // Error meddelelser - Hjælpsomme og action-oriented
  error: {
    noSolution: 'Ingen løsning fundet endnu. Tilføj flere detaljer om kundens situation for bedre resultater.',
    noProductsFound: 'Produkt ikke fundet. Prøv at søge på mærke, model eller EAN-kode.',
    searchFailed: (message) => `Søgning fejlede. Tjek internetforbindelsen eller prøv igen.`,
    couldNotFindSolution: 'Behøver flere oplysninger for at finde den perfekte løsning. Tilføj streaming-tjenester eller mobiludgifter.',
    scannerAccess: 'Kamera-adgang nægtet. Tillad kamera i browser-indstillinger eller brug manuel søgning.',
    scannerUnsupported: 'Kamera-scanning ikke understøttet. Brug søgefeltet til at finde produktet.',
    validation: (field, message) => `Ret fejl i ${field}: ${message}`,
    networkError: 'Forbindelsesfejl. Tjek internet og prøv igen.',
    apiUnavailable: 'Tjenesten er midlertidigt utilgængelig. Prøv igen om et øjeblik.',
    invalidData: 'Ugyldige data indtastet. Kontroller og ret venligst.',
    cartEmpty: 'Ingen produkter valgt. Tilføj abonnementer for at fortsætte.',
    calculationError: 'Beregning fejlede. Prøv at genindlæse siden.',
    saveFailed: 'Kunne ikke gemme. Prøv igen eller kontakt support hvis problemet fortsætter.'
  },

  // Warning meddelelser - Forsigtige påmindelser
  warning: {
    highCostDifference: (difference) => `Stort prisgab på ${difference} kr. Overvej at justere løsningen.`,
    streamingOverBudget: (budget, actual) => `Streaming-udgifter overstiger budget: ${budget} kr vs ${actual} kr`,
    planMayExpire: (planName, days) => `${planName} udløber om ${days} dage - planlæg opfølgning`,
    dataUsageHigh: (usage) => `Højt dataforbrug på ${usage} GB. Overvej større datapakke.`,
    competitionRisk: 'Kunden har allerede abonnement hos konkurrent - fremhæv vores fordele',
    incompleteCustomerData: 'Manglende kundeoplysninger kan give upræcise beregninger'
  },

  // Info meddelelser - Neutrale oplysninger
  info: {
    autoSaveEnabled: 'Auto-gemning aktiveret - dine ændringer gemmes automatisk',
    presentationModeTip: 'Brug P på tastaturet til at skifte til præsentationstilstand',
    calculationUpdated: 'Beregning opdateret med nye priser og rabatter',
    newPlansAvailable: 'Nye abonnementer er nu tilgængelige - se efter opdateringer',
    featureHighlight: (feature) => `Tip: ${feature} er nu tilgængelig i denne løsning`,
    keyboardShortcuts: 'Tryk Ctrl+R for at nulstille eller Ctrl+P for præsentation'
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

