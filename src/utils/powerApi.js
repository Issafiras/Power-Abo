/**
 * Power.dk API service
 * Håndterer integration med Power.dk's API for produkt søgning og pris hentning
 */

/**
 * Power.dk API service
 * Håndterer integration med Power.dk's API for produkt søgning og pris hentning
 * Optimeret for maksimal effektivitet og hastighed
 */

// Bestem API base URL baseret på miljø
const isProduction = window.location.hostname === 'issafiras.github.io';

// Tillad konfiguration af API nøgler via miljøvariabler (fx Vite)
const PROXY_CORS_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PROXY_CORS_API_KEY)
  ? import.meta.env.VITE_PROXY_CORS_API_KEY
  : null;

// Optimeret liste af proxy-tjenester med bedste først
const PROXY_SERVICES = [
  {
    name: 'CodeTabs',
    buildUrl: (targetUrl) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl)}`,
    headers: {
      'Accept': 'application/json'
    },
    priority: 1, // Højeste prioritet
    timeout: 2500 // Hurtigste timeout
  },
  {
    name: 'CorsProxy.io',
    buildUrl: (targetUrl) => `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
    headers: {
      'Accept': 'application/json'
    },
    priority: 2,
    timeout: 3000
  },
  {
    name: 'ProxyCors',
    buildUrl: (targetUrl) => `https://proxy.cors.sh/${targetUrl}`,
    headers: {
      'Accept': 'application/json',
      ...(PROXY_CORS_API_KEY ? { 'x-cors-api-key': PROXY_CORS_API_KEY } : {})
    },
    priority: 3,
    timeout: 4000
  },
  {
    name: 'AllOrigins',
    buildUrl: (targetUrl) => `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    headers: {
      'Accept': 'application/json'
    },
    transformResponse: async (response, targetUrl) => {
      // AllOrigins raw-endpoint returnerer allerede ren respons, men vi sikrer
      // ensartethed ved at klone dataen.
      const payload = await response.text();

      return new Response(payload, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Source': 'AllOrigins',
          'X-Target-Url': targetUrl
        }
      });
    },
    priority: 4,
    timeout: 4500
  },
  {
    name: 'ThingProxy',
    buildUrl: (targetUrl) => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(targetUrl)}`,
    headers: {
      'Accept': 'application/json'
    },
    priority: 5,
    timeout: 5000
  },
  {
    name: 'CorsAnywhere',
    buildUrl: (targetUrl) => `https://cors-anywhere.herokuapp.com/${targetUrl}`,
    headers: {
      'Accept': 'application/json'
    },
    priority: 6,
    timeout: 6000
  }
];

// Optimeret konfiguration
const CONFIG = {
  PARALLEL_PROXY_LIMIT: 2, // Test maks 2 proxyer parallelt
  FAST_TIMEOUT: 2000, // Hurtig timeout for parallel test
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutter cache
  MAX_RETRIES: 2, // Reduceret retries for hurtigere fejlhåndtering
  BACKOFF_BASE: 100 // Hurtigere backoff
};

// Avanceret cache system
const cache = new Map();
const proxyStats = {
  successCount: {},
  failureCount: {},
  avgResponseTime: {},
  lastUsed: {},
  healthScore: {} // 0-1 score baseret på performance
};

// Cache for at huske hvilken proxy der virkede sidst
let workingProxyIndex = null;
let lastCacheUpdate = 0;

const POWER_API_BASE = isProduction 
  ? 'https://www.power.dk/api/v2'
  : '/api/power';

/**
 * Beregn proxy health score baseret på performance
 */
function calculateHealthScore(proxyIndex) {
  const stats = proxyStats;
  const success = stats.successCount[proxyIndex] || 0;
  const failures = stats.failureCount[proxyIndex] || 0;
  const total = success + failures;
  
  if (total === 0) return 0.5; // Neutral score for nye proxyer
  
  const successRate = success / total;
  const avgTime = stats.avgResponseTime[proxyIndex] || 5000;
  const timeScore = Math.max(0, 1 - (avgTime / 10000)); // Normaliseret til 0-1
  
  // Kombiner success rate og response time
  return (successRate * 0.7) + (timeScore * 0.3);
}

/**
 * Opdater proxy statistikker
 */
function updateProxyStats(proxyIndex, success, responseTime) {
  const stats = proxyStats;
  
  if (success) {
    stats.successCount[proxyIndex] = (stats.successCount[proxyIndex] || 0) + 1;
    
    // Opdater gennemsnitlig response time
    const currentAvg = stats.avgResponseTime[proxyIndex] || responseTime;
    stats.avgResponseTime[proxyIndex] = (currentAvg + responseTime) / 2;
  } else {
    stats.failureCount[proxyIndex] = (stats.failureCount[proxyIndex] || 0) + 1;
  }
  
  stats.lastUsed[proxyIndex] = Date.now();
  stats.healthScore[proxyIndex] = calculateHealthScore(proxyIndex);
}

/**
 * Hent bedste proxyer baseret på health score
 */
function getBestProxies() {
  return PROXY_SERVICES.map((proxy, index) => ({
    index,
    proxy,
    healthScore: proxyStats.healthScore[index] || 0.5,
    priority: proxy.priority
  }))
  .sort((a, b) => {
    // Sorter efter health score først, derefter prioritet
    if (Math.abs(a.healthScore - b.healthScore) < 0.1) {
      return a.priority - b.priority;
    }
    return b.healthScore - a.healthScore;
  });
}

/**
 * Tjek cache for eksisterende resultat
 */
function getCachedResult(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    console.log('🚀 Cache hit for:', url);
    return cached.data;
  }
  return null;
}

/**
 * Gem resultat i cache
 */
function setCachedResult(url, data) {
  cache.set(url, {
    data,
    timestamp: Date.now()
  });
  
  // Ryd gammel cache hvis den bliver for stor
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

/**
 * Optimeret proxy-test med parallel execution
 */
async function tryProxyFast(proxyIndex, targetUrl, options) {
  const proxy = PROXY_SERVICES[proxyIndex];
  const proxyName = proxy.name;
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.FAST_TIMEOUT);
  const method = (options.method || 'GET').toUpperCase();

  // Undgå unødvendige headers for simple GET requests for at minimere CORS preflight
  const sanitizedHeaders = { ...(options.headers || {}) };
  if (method === 'GET') {
    delete sanitizedHeaders['Content-Type'];
  }

  try {
    const proxyUrl = proxy.buildUrl(targetUrl);

    let response = await fetch(proxyUrl, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...proxy.headers,
        ...sanitizedHeaders
      },
      signal: controller.signal
    });

    if (proxy.transformResponse) {
      response = await proxy.transformResponse(response, targetUrl);
    }

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      updateProxyStats(proxyIndex, true, responseTime);
      console.log(`⚡ ${proxyName} (${responseTime}ms)`);
      return { response, proxyIndex, responseTime };
    } else {
      updateProxyStats(proxyIndex, false, responseTime);
      throw new Error(`${proxyName}: ${response.status}`);
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateProxyStats(proxyIndex, false, responseTime);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test flere proxyer parallelt for maksimal hastighed
 */
async function testProxiesParallel(targetUrl, options) {
  const bestProxies = getBestProxies().slice(0, CONFIG.PARALLEL_PROXY_LIMIT);
  
  console.log(`🚀 Test ${bestProxies.length} proxyer parallelt`);
  
  const promises = bestProxies.map(({ index }) => 
    tryProxyFast(index, targetUrl, options)
      .then(result => ({ success: true, ...result }))
      .catch(error => ({ success: false, error, proxyIndex: index }))
  );

  const results = await Promise.allSettled(promises);
  
  // Find den første succesfulde
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      return result.value.response;
    }
  }
  
  throw new Error('Alle parallelle proxyer fejlede');
}

/**
 * Optimeret fetch med intelligent proxy-valg og caching
 */
async function fetchWithProxyFallback(url, options = {}, attempt = 1) {
  if (!isProduction) {
    // I udviklingsmiljø, brug direkte URL med retry logik
    return fetchWithRetry(url, options, attempt);
  }

  // Tjek cache først
  const cached = getCachedResult(url);
  if (cached) {
    // Returner et mock Response objekt for cache hits
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => cached,
      clone: () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => cached
      })
    };
  }

  const targetUrl = url;
  
  try {
    // Prøv parallelle proxyer først for maksimal hastighed
    const response = await testProxiesParallel(targetUrl, options);
    
    // Gem i cache hvis succesfuld
    const data = await response.clone().json();
    setCachedResult(url, data);
    
    return response;
  } catch (error) {
    console.log(`⚠️ Parallelle proxyer fejlede, prøver sekventielt...`);
    
    // Fallback til sekventiel testing
    const bestProxies = getBestProxies();
    
    for (const { index, proxy } of bestProxies) {
      try {
        const response = await tryProxyFast(index, targetUrl, options);
        
        // Gem i cache hvis succesfuld
        const data = await response.response.clone().json();
        setCachedResult(url, data);
        
        return response.response;
      } catch (proxyError) {
        console.log(`❌ ${proxy.name} fejlede:`, proxyError.message);
        continue;
      }
    }
    
    // Hvis alle fejler, prøv retry med eksponentiel backoff
    if (attempt < CONFIG.MAX_RETRIES) {
      const backoff = CONFIG.BACKOFF_BASE * Math.pow(2, attempt - 1);
      console.log(`⏳ Retry ${attempt}/${CONFIG.MAX_RETRIES} om ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithProxyFallback(url, options, attempt + 1);
    }
    
    throw new Error(`Alle proxy-tjenester fejlede efter ${CONFIG.MAX_RETRIES} forsøg`);
  }
}

/**
 * Nulstil proxy cache og statistikker
 */
export function resetProxyCache() {
  cache.clear();
  workingProxyIndex = null;
  
  // Nulstil statistikker
  Object.keys(proxyStats).forEach(key => {
    if (typeof proxyStats[key] === 'object') {
      Object.keys(proxyStats[key]).forEach(index => {
        delete proxyStats[key][index];
      });
    }
  });
  
  console.log('🔄 Proxy cache og statistikker nulstillet');
}

/**
 * Vis avancerede proxy-statistikker
 */
export function getProxyStats() {
  const stats = PROXY_SERVICES.map((proxy, index) => {
    const success = proxyStats.successCount[index] || 0;
    const failures = proxyStats.failureCount[index] || 0;
    const total = success + failures;
    const successRate = total > 0 ? (success / total * 100).toFixed(1) : 'N/A';
    const avgTime = proxyStats.avgResponseTime[index] || 0;
    const healthScore = proxyStats.healthScore[index] || 0;
    
    return {
      name: proxy.name,
      priority: proxy.priority,
      success,
      failures,
      total,
      successRate: `${successRate}%`,
      avgResponseTime: `${avgTime.toFixed(0)}ms`,
      healthScore: `${(healthScore * 100).toFixed(1)}%`,
      lastUsed: proxyStats.lastUsed[index] ? new Date(proxyStats.lastUsed[index]).toLocaleTimeString() : 'Never'
    };
  });
  
  console.log('📊 Avancerede proxy-statistikker:', stats);
  return stats;
}

/**
 * Prefetch bedste proxyer for hurtigere første kald
 */
export async function prefetchProxies() {
  if (!isProduction) return;
  
  const testUrl = `${POWER_API_BASE}/productlists?q=test&size=1`;
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  console.log('🚀 Prefetching proxyer for hurtigere første kald...');
  
  try {
    await testProxiesParallel(testUrl, options);
    console.log('✅ Proxy prefetch fuldført');
  } catch (error) {
    console.log('⚠️ Proxy prefetch fejlede:', error.message);
  }
}

/**
 * Hjælpefunktion til retry logik for direkte API kald
 * @param {string} url - URL til at hente
 * @param {Object} options - Fetch options
 * @param {number} attempt - Nuværende forsøg
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithRetry(url, options = {}, attempt = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    console.log(`🔄 API kald forsøg ${attempt}: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        ...options.headers
      },
      signal: controller.signal
    });

    if (response.ok) {
      console.log(`✅ API kald succesfuldt`);
      return response;
    } else {
      // Hvis det er en 429 eller 5xx fejl, prøv retry
      if ((response.status === 429 || response.status >= 500) && attempt < 3) {
        const backoff = [250, 750, 1750][attempt - 1];
        console.log(`⏳ API returnerede ${response.status}, prøver igen om ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, attempt + 1);
      }
      
      throw new Error(`API fejlede: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (attempt < 3 && !controller.signal.aborted) {
      const backoff = [250, 750, 1750][attempt - 1];
      console.log(`⏳ Netværksfejl, prøver igen om ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
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
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
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
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
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

    const extractDirectPrice = (product) => {
      const candidates = [
        product?.price,
        product?.currentPrice,
        product?.priceInfo?.currentPrice,
        product?.priceInfo?.price,
        product?.priceInfo?.priceWithoutSubscription,
        product?.priceData?.price,
        product?.priceData?.currentPrice
      ];

      for (const value of candidates) {
        if (typeof value === 'number' && !Number.isNaN(value)) {
          return value;
        }

        if (typeof value === 'string') {
          const trimmed = value.trim();
          let normalized = trimmed;

          if (normalized.includes(',')) {
            normalized = normalized.replace(/\./g, '').replace(/,/g, '.');
          }

          normalized = normalized.replace(/[^0-9.]/g, '');

          const parsed = Number.parseFloat(normalized);
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }

      return null;
    };

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
      searchResult.products.forEach(product => {
        const directPrice = extractDirectPrice(product);
        if (directPrice != null) {
          prices[product.productId] = directPrice;
        }
      });

      const missingPriceIds = productIds.filter(productId => !(productId in prices));

      if (missingPriceIds.length === 0) {
        console.log('✅ Brugte direkte priser fra produktsøgningen – ekstra pris-kald er ikke nødvendigt');
      }

      if (missingPriceIds.length > 0) {
        try {
          const fetchedPrices = await getProductPrices(missingPriceIds);
          prices = {
            ...prices,
            ...fetchedPrices
          };
          console.log('🧩 Kombinerede direkte produktpriser med API priser for manglende ID\'er');
        } catch (priceError) {
          console.warn('⚠️ Kunne ikke hente priser, men produkter blev fundet:', priceError.message);
          console.log('💡 Bruger priser direkte fra produktobjekter i stedet');

          // Fallback: Brug priser direkte fra produktobjekter
          searchResult.products.forEach(product => {
            const directPrice = extractDirectPrice(product);
            if (directPrice != null) {
              prices[product.productId] = directPrice;
              console.log(`💰 Pris fra produkt: ${product.productId} = ${directPrice}`);
            }
          });
        }
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