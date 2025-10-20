/**
 * Power.dk API service
 * Håndterer integration med Power.dk's API for produkt søgning og pris hentning
 */

// Bestem API base URL baseret på miljø
const isProduction = window.location.hostname === 'issafiras.github.io';

// Liste af alternative CORS proxy-tjenester.
// Vi bruger konfigurationsobjekter for at kunne håndtere forskellige URL-formater og tilpasse headers per proxy.
const PROXY_SERVICES = [
  {
    name: 'AllOrigins',
    buildUrl: (targetUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  },
  {
    name: 'CodeTabs',
    buildUrl: (targetUrl) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl)}`
  },
  {
    name: 'IsomorphicGit',
    buildUrl: (targetUrl) => `https://cors.isomorphic-git.org/${targetUrl}`
  },
  {
    name: 'CorsProxy.io',
    buildUrl: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  }
];

const PROXY_TIMEOUT_MS = 3000; // Reduceret fra 8s til 3s for hurtigere fejlhåndtering

// Cache for at huske hvilken proxy der virkede sidst
let workingProxyIndex = null;
let proxySuccessCount = {}; // Tæller succes for hver proxy
let proxyFailureCount = {}; // Tæller fejl for hver proxy

const POWER_API_BASE = isProduction 
  ? 'https://www.power.dk/api/v2'
  : '/api/power';

/**
 * Prøv en enkelt proxy-tjeneste
 */
async function trySingleProxy(proxyIndex, targetUrl, options) {
  const proxy = PROXY_SERVICES[proxyIndex];
  const proxyName = proxy.name || `Proxy ${proxyIndex + 1}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const proxyUrl = proxy.buildUrl(targetUrl);
    console.log(`🔄 Prøver proxy: ${proxyName}`);
    
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options.headers,
        ...(proxy.headers || {}),
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: controller.signal
    });

    if (response.ok) {
      console.log(`✅ ${proxyName} virker!`);
      proxySuccessCount[proxyIndex] = (proxySuccessCount[proxyIndex] || 0) + 1;
      return response;
    } else {
      proxyFailureCount[proxyIndex] = (proxyFailureCount[proxyIndex] || 0) + 1;
      throw new Error(`${proxyName} fejlede: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    proxyFailureCount[proxyIndex] = (proxyFailureCount[proxyIndex] || 0) + 1;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Prøv at hente data via forskellige proxy-tjenester med retry logik
 * @param {string} url - URL til at hente
 * @param {Object} options - Fetch options
 * @param {number} attempt - Nuværende forsøg (internt brugt)
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithProxyFallback(url, options = {}, attempt = 1) {
  if (!isProduction) {
    // I udviklingsmiljø, brug direkte URL med retry logik
    return fetchWithRetry(url, options, attempt);
  }

  const targetUrl = url;
  let lastError = null;

  // Sorter proxy-tjenester baseret på succes-rate
  const getProxyScore = (index) => {
    const success = proxySuccessCount[index] || 0;
    const failures = proxyFailureCount[index] || 0;
    const total = success + failures;
    if (total === 0) return 0.5; // Neutrale score for nye proxy-tjenester
    return success / total;
  };

  // Sorter proxy-tjenester efter score (højeste først)
  const proxyIndices = Array.from({length: PROXY_SERVICES.length}, (_, i) => i)
    .sort((a, b) => getProxyScore(b) - getProxyScore(a));

  // Prøv de to bedste proxy-tjenester parallelt som fallback
  if (proxyIndices.length >= 2) {
    const bestProxy = proxyIndices[0];
    const secondBestProxy = proxyIndices[1];
    
    // Hvis den bedste proxy har en god score, prøv kun den først
    if (getProxyScore(bestProxy) > 0.7) {
      console.log(`🚀 Prøver kun den bedste proxy: ${PROXY_SERVICES[bestProxy].name}`);
      try {
        const result = await trySingleProxy(bestProxy, targetUrl, options);
        if (result) return result;
      } catch (error) {
        console.log(`⚠️ Bedste proxy fejlede, prøver næstbedste...`);
      }
    }
  }

  for (let i = 0; i < proxyIndices.length; i++) {
    const proxyIndex = proxyIndices[i];
    const proxy = PROXY_SERVICES[proxyIndex];
    const proxyName = proxy.name || `Proxy ${proxyIndex + 1}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    try {
      const proxyUrl = proxy.buildUrl(targetUrl);
      const isRetryingWorkingProxy = workingProxyIndex !== null && i === 0;
      console.log(`🔄 Prøver proxy ${i + 1}/${proxyIndices.length}: ${proxyName}${isRetryingWorkingProxy ? ' (cached)' : ''}`);
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          ...(proxy.headers || {}),
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: controller.signal
      });

      if (response.ok) {
        console.log(`✅ ${proxyName} virker!`);
        // Registrer succes
        proxySuccessCount[proxyIndex] = (proxySuccessCount[proxyIndex] || 0) + 1;
        workingProxyIndex = proxyIndex;
        return response;
      } else {
        // Hvis det er en 429 eller 5xx fejl, prøv retry
        if ((response.status === 429 || response.status >= 500) && attempt < 3) {
          const backoff = [250, 750, 1750][attempt - 1];
          console.log(`⏳ ${proxyName} returnerede ${response.status}, prøver igen om ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          return fetchWithProxyFallback(url, options, attempt + 1);
        }
        
        console.warn(`⚠️ ${proxyName} returnerede status ${response.status}`);
        // Registrer fejl
        proxyFailureCount[proxyIndex] = (proxyFailureCount[proxyIndex] || 0) + 1;
        lastError = new Error(`${proxyName} fejlede: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Registrer fejl
      proxyFailureCount[proxyIndex] = (proxyFailureCount[proxyIndex] || 0) + 1;
      
      if (error.name === 'AbortError') {
        console.warn(`⏱️ ${proxyName} overskred timeout på ${PROXY_TIMEOUT_MS}ms`);
        lastError = new Error(`${proxyName} overskred timeout`);
      } else {
        console.warn(`❌ ${proxyName} fejlede:`, error.message);
        lastError = error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Hvis alle proxy-tjenester fejler, nulstil cache og kast fejl
  workingProxyIndex = null;
  throw new Error(`Alle proxy-tjenester fejlede. Sidste fejl: ${lastError?.message || 'Ukendt fejl'}`);
}

/**
 * Nulstil proxy cache (nyttigt hvis cached proxy begynder at fejle)
 */
export function resetProxyCache() {
  workingProxyIndex = null;
  proxySuccessCount = {};
  proxyFailureCount = {};
  console.log('🔄 Proxy cache og statistikker nulstillet');
}

/**
 * Vis proxy-statistikker for debugging
 */
export function getProxyStats() {
  const stats = PROXY_SERVICES.map((proxy, index) => {
    const success = proxySuccessCount[index] || 0;
    const failures = proxyFailureCount[index] || 0;
    const total = success + failures;
    const successRate = total > 0 ? (success / total * 100).toFixed(1) : 'N/A';
    
    return {
      name: proxy.name,
      success,
      failures,
      total,
      successRate: `${successRate}%`
    };
  });
  
  console.log('📊 Proxy-statistikker:', stats);
  return stats;
}

/**
 * Hjælpefunktion til retry logik for direkte API kald
 * @param {string} url - URL til at hente
 * @param {Object} options - Fetch options
 * @param {number} attempt - Nuværende forsøg
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithRetry(url, options = {}, attempt = 1) {
  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store'
    });
    
    if (response.ok) {
      return response;
    }
    
    // Retry på 429 eller 5xx fejl
    if ((response.status === 429 || response.status >= 500) && attempt < 3) {
      const backoff = [250, 750, 1750][attempt - 1];
      console.log(`⏳ API returnerede ${response.status}, prøver igen om ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, attempt + 1);
    }
    
    return response;
  } catch (error) {
    if (attempt < 3) {
      const backoff = [250, 750, 1750][attempt - 1];
      console.log(`⏳ Netværksfejl, prøver igen om ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw error;
  }
}

/**
 * Søg efter produkter baseret på søgeterm (EAN, navn, mærke, beskrivelse osv.)
 * @param {string} searchTerm - Søgeterm (EAN-kode, produktnavn, mærke osv.)
 * @returns {Promise<Object>} API response med produkter
 */
export async function searchProductsByEAN(searchTerm) {
  try {
    console.log('🔍 Søger efter produkter med term:', searchTerm);
    const url = `${POWER_API_BASE}/productlists?q=${encodeURIComponent(searchTerm)}&size=10`;
    console.log('📡 API URL:', url);
    
    const response = await fetchWithProxyFallback(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`API fejl: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Søgeresultat:', {
      totalCount: data.totalProductCount,
      productsFound: data.products?.length || 0,
      hasFilters: !!data.filters
    });
    
    // Debug: Vis den fulde API response for at se strukturen
    if (data.products && data.products.length > 0) {
      console.log('🔍 Første produkt struktur:', data.products[0]);
      console.log('🔑 Tilgængelige felter:', Object.keys(data.products[0]));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Fejl ved søgning efter produkter:', error);
    
    if (error.message.includes('Alle proxy-tjenester fejlede')) {
      throw new Error('Alle CORS proxy-tjenester er utilgængelige. Prøv igen senere.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Netværksfejl: Kunne ikke oprette forbindelse til Power.dk API.');
    } else {
      throw new Error(`Kunne ikke søge efter produkter: ${error.message}`);
    }
  }
}

/**
 * Hent priser for specifikke produkter
 * @param {string|Array} productIds - Produkt ID'er (komma-separeret string eller array)
 * @returns {Promise<Object>} API response med priser
 */
export async function getProductPrices(productIds) {
  try {
    // Konverter array til komma-separeret string hvis nødvendigt
    const idsString = Array.isArray(productIds) ? productIds.join(',') : productIds;
    
    console.log('💰 Henter priser for produkt ID\'er:', productIds);
    console.log('🔗 Konverteret til string:', idsString);
    
    // Valider at der er produkt ID'er at søge efter
    if (!idsString || idsString.trim() === '') {
      console.warn('⚠️ Ingen produkt ID\'er at søge efter');
      return {};
    }
    
    const url = `${POWER_API_BASE}/products/prices?ids=${idsString}`;
    console.log('📡 Pris API URL:', url);
    
    const response = await fetchWithProxyFallback(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('📊 Pris response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`API fejl: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Priser hentet:', {
      priceCount: Object.keys(data).length,
      prices: data
    });
    return data;
  } catch (error) {
    console.error('❌ Fejl ved hentning af priser:', error);
    
    if (error.message.includes('Alle proxy-tjenester fejlede')) {
      throw new Error('Alle CORS proxy-tjenester er utilgængelige. Prøv igen senere.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Netværksfejl: Kunne ikke oprette forbindelse til Power.dk API.');
    } else {
      throw new Error(`Kunne ikke hente priser: ${error.message}`);
    }
  }
}

/**
 * Søg efter produkter og hent priser i ét kald
 * @param {string} searchTerm - Søgeterm (EAN-kode, produktnavn, mærke osv.)
 * @returns {Promise<Object>} Kombineret data med produkter og priser
 */
export async function searchProductsWithPrices(searchTerm) {
  try {
    console.log('🚀 Starter kombineret søgning for term:', searchTerm);
    
    // Først søg efter produkter
    const searchResult = await searchProductsByEAN(searchTerm);

    // Fallback: Hvis der ikke er produkter i svaret, men filters indeholder BasicPrice med min==max,
    // så brug dette tal som pris.
    if (!searchResult.products || searchResult.products.length === 0) {
      console.log('🔍 Ingen produkter fundet, tjekker for fallback pris...');
      let fallbackPrice = null;
      if (Array.isArray(searchResult.filters)) {
        const priceFilter = searchResult.filters.find(f => f.attributeId === 'BasicPrice');
        if (priceFilter && typeof priceFilter.min === 'number' && typeof priceFilter.max === 'number') {
          if (priceFilter.min === priceFilter.max) {
            fallbackPrice = priceFilter.min;
            console.log('💰 Fallback pris fundet:', fallbackPrice);
          }
        }
      }

      const result = {
        products: [],
        prices: {},
        totalCount: searchResult.totalProductCount || 0,
        message: fallbackPrice != null 
          ? 'Pris fundet via filter (min=max)'
          : 'Ingen produkter fundet for denne søgeterm',
        fallbackPrice
      };
      console.log('📋 Fallback resultat:', result);
      return result;
    }
    
    // Hent produkt ID'er
    const productIds = searchResult.products.map(product => product.productId);
    console.log('🆔 Produkt ID\'er fundet:', productIds);
    
    // Kun hent priser hvis der er produkter
    let prices = {};
    if (productIds.length > 0) {
      try {
        prices = await getProductPrices(productIds);
      } catch (priceError) {
        console.warn('⚠️ Kunne ikke hente priser, men produkter blev fundet:', priceError.message);
        console.log('💡 Bruger priser direkte fra produktobjekter i stedet');
        
        // Fallback: Brug priser direkte fra produktobjekter
        searchResult.products.forEach(product => {
          if (product.price !== undefined) {
            prices[product.productId] = product.price;
            console.log(`💰 Pris fra produkt: ${product.productId} = ${product.price}`);
          }
        });
      }
    }
    
    const finalResult = {
      products: searchResult.products,
      prices: prices,
      totalCount: searchResult.totalProductCount,
      message: `${searchResult.products.length} produkter fundet`
    };
    console.log('🎯 Endeligt resultat:', finalResult);
    return finalResult;
  } catch (error) {
    console.error('❌ Fejl ved kombineret søgning:', error);
    
    // Giv mere specifik fejlhåndtering
    if (error.message.includes('Alle proxy-tjenester fejlede')) {
      throw new Error('Alle CORS proxy-tjenester er utilgængelige. Prøv igen senere eller kontakt support.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Netværksfejl: Kunne ikke oprette forbindelse til Power.dk API. Tjek din internetforbindelse.');
    } else if (error.message.includes('API fejl')) {
      throw new Error(`Power.dk API fejl: ${error.message}`);
    } else {
      throw new Error(`Uventet fejl: ${error.message}`);
    }
  }
}

/**
 * Valider søgeterm (EAN-kode eller almindelig tekst)
 * @param {string} searchTerm - Søgeterm til validering
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateEAN(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return { valid: false, message: 'Søgeterm er påkrævet' };
  }
  
  const trimmedTerm = searchTerm.trim();
  if (trimmedTerm.length < 2) {
    return { valid: false, message: 'Søgeterm skal være mindst 2 tegn' };
  }
  
  // Hvis det ser ud som en EAN-kode (kun tal), valider længden
  const cleanEAN = trimmedTerm.replace(/\D/g, '');
  if (cleanEAN === trimmedTerm && (cleanEAN.length < 8 || cleanEAN.length > 14)) {
    return { valid: false, message: 'EAN-kode skal være mellem 8-14 cifre' };
  }
  
  return { valid: true, message: 'Gyldig søgeterm' };
}

/**
 * Format produkt data til applikationens format
 * @param {Object} product - Rå produkt data fra API
 * @param {Object} prices - Pris data fra API
 * @returns {Object} Formateret produkt
 */
export function formatProductData(product, prices = {}) {
  const price = prices[product.productId] || product.price || 0;
  
  return {
    id: product.productId,
    name: product.title || product.name || 'Ukendt produkt',
    brand: product.manufacturerName || product.brand || 'Ukendt mærke',
    price: price,
    image: product.productImage || product.image || product.thumbnail,
    description: product.shortDescription || product.description || '',
    availability: product.webStockStatus || product.availability || 'Ukendt',
    category: product.categoryName || product.category || 'Ukendt kategori',
    ean: product.eanGtin12 || product.ean || product.gtin,
    url: product.url || product.link
  };
}
