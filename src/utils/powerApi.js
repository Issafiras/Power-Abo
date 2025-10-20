/**
 * Power.dk API service
 * Håndterer integration med Power.dk's API for produkt søgning og pris hentning
 */

// Bestem API base URL baseret på miljø
const isProduction = window.location.hostname === 'issafiras.github.io';

// Liste af alternative CORS proxy-tjenester
const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?'
];

const POWER_API_BASE = isProduction 
  ? 'https://www.power.dk/api/v2'
  : '/api/power';

/**
 * Prøv at hente data via forskellige proxy-tjenester
 * @param {string} url - URL til at hente
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithProxyFallback(url, options = {}) {
  if (!isProduction) {
    // I udviklingsmiljø, brug direkte URL
    return fetch(url, options);
  }

  const targetUrl = url;
  let lastError = null;

  for (let i = 0; i < PROXY_SERVICES.length; i++) {
    const proxy = PROXY_SERVICES[i];
    let proxyUrl;
    
    try {
      if (proxy.includes('allorigins.win')) {
        proxyUrl = `${proxy}${encodeURIComponent(targetUrl)}`;
      } else if (proxy.includes('corsproxy.io')) {
        proxyUrl = `${proxy}${targetUrl}`;
      } else {
        proxyUrl = `${proxy}${targetUrl}`;
      }

      console.log(`🔄 Prøver proxy ${i + 1}/${PROXY_SERVICES.length}: ${proxy}`);
      
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        console.log(`✅ Proxy ${i + 1} virker!`);
        return response;
      } else {
        console.warn(`⚠️ Proxy ${i + 1} returnerede status ${response.status}`);
        lastError = new Error(`Proxy ${i + 1} fejlede: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`❌ Proxy ${i + 1} fejlede:`, error.message);
      lastError = error;
    }
  }

  // Hvis alle proxy-tjenester fejler, kast den sidste fejl
  throw new Error(`Alle proxy-tjenester fejlede. Sidste fejl: ${lastError?.message || 'Ukendt fejl'}`);
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
    
    const url = `${POWER_API_BASE}/products/prices?productIdsStr=${idsString}`;
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
