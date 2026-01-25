/**
 * Share utility functions
 * Håndterer deling af tilbud via URL og QR kode
 */

/**
 * Pak app state ned i en URL-venlig streng (Base64 encoded JSON)
 * @param {Object} state - Den state der skal deles
 * @returns {string} Encoded string
 */
export function encodeState(state) {
  try {
    const shareableData = {
      c: state.cartItems.map(item => ({
        id: item.plan.id,
        q: item.quantity,
        mix: item.cbbMixEnabled,
        cnt: item.cbbMixCount
      })),
      mc: state.customerMobileCost,
      bc: state.broadbandCost,
      s: state.selectedStreaming,
      op: state.originalItemPrice,
      bb: state.buybackAmount,
      l: state.numberOfLines
    };

    const jsonString = JSON.stringify(shareableData);
    return btoa(jsonString);
  } catch (error) {
    console.error('Fejl ved encoding af state:', error);
    return '';
  }
}

/**
 * Udpak state fra en URL-venlig streng
 * @param {string} encoded - Encoded string
 * @returns {Object|null} Decoded state eller null
 */
export function decodeState(encoded) {
  try {
    const jsonString = atob(encoded);
    const data = JSON.parse(jsonString);

    return {
      cartItems: data.c || [],
      customerMobileCost: data.mc || 0,
      broadbandCost: data.bc || 0,
      selectedStreaming: data.s || [],
      originalItemPrice: data.op || 0,
      buybackAmount: data.bb || 0,
      numberOfLines: data.l || 1
    };
  } catch (error) {
    console.error('Fejl ved decoding af state:', error);
    return null;
  }
}

/**
 * Generer fuld dele-URL
 * @param {Object} state - Den state der skal deles
 * @returns {string} Fuld URL
 */
export function generateShareUrl(state) {
  const encoded = encodeState(state);
  const baseUrl = window.location.href.split('?')[0];
  return `${baseUrl}?offer=${encoded}`;
}
