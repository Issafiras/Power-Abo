import { useCallback } from 'react';
import { findBestSolution } from '../utils/calculations';
import { calculateCustomerTotal } from '../utils/calculations/pricing';
import { getServiceById, streamingServices as staticStreaming } from '../data/streamingServices';
import { plans } from '../data/plans';
import { toast } from '../utils/toast';
import COPY from '../constants/copy';

export function useAutoSelectSolution(state, actions) {
    const handleAutoSelectSolution = useCallback(() => {
        try {
            const availablePlans = plans;
            const availableStreaming = staticStreaming;

            // Valider input
            if (!Array.isArray(availablePlans) || availablePlans.length === 0) {
                toast(COPY.error.couldNotFindSolution, 'error');
                return;
            }

            // Funktion til at hente streaming-pris med defensive checks
            const getStreamingPrice = (serviceId) => {
                try {
                    if (serviceId == null) return 0;
                    const service = availableStreaming.find(s => s && s.id === serviceId) || getServiceById(serviceId);
                    if (!service || typeof service !== 'object') return 0;
                    const price = service.price;
                    return (price != null && Number.isFinite(price) && price >= 0) ? price : 0;
                } catch (e) {
                    return 0;
                }
            };

            // Valider state værdier før brug
            const validNumberOfLines = Number.isInteger(state.numberOfLines) && state.numberOfLines > 0 && state.numberOfLines <= 20
                ? state.numberOfLines
                : 1;

            const validCustomerMobileCost = Number.isFinite(state.customerMobileCost) && state.customerMobileCost >= 0
                ? state.customerMobileCost
                : 0;

            const validBroadbandCost = Number.isFinite(state.broadbandCost) && state.broadbandCost >= 0
                ? state.broadbandCost
                : 0;

            const validOriginalItemPrice = Number.isFinite(state.originalItemPrice) && state.originalItemPrice >= 0
                ? state.originalItemPrice
                : 0;

            const validSelectedStreaming = Array.isArray(state.selectedStreaming) ? state.selectedStreaming : [];

            // Beregn kundens nuværende totale udgifter inkl. bredbånd
            const streamingCost = validSelectedStreaming.reduce((sum, id) => sum + (Number.isFinite(getStreamingPrice(id)) ? getStreamingPrice(id) : 0), 0);
            const totalCurrentCost = validCustomerMobileCost + validBroadbandCost;
            const customerTotal = calculateCustomerTotal(totalCurrentCost, streamingCost, validOriginalItemPrice);
            const validCustomerSixMonth = customerTotal.sixMonth || 0;

            // Find bedste løsning - brug numberOfLines som maksimum
            // Ekskluder planer fra eksisterende brands
            const excludedProviders = [];

            // Sikre array operation for existingBrands
            if (Array.isArray(state.existingBrands)) {
                state.existingBrands.forEach(brand => {
                    if (brand && typeof brand === 'string') {
                        // Konverter brand navn til provider format
                        if (brand === 'Telmore') excludedProviders.push('telmore');
                        else if (brand === 'Telenor') excludedProviders.push('telenor');
                        else if (brand === 'CBB') excludedProviders.push('cbb');
                        else excludedProviders.push(brand.toLowerCase());
                    }
                });
            }

            const result = findBestSolution(
                availablePlans,
                validSelectedStreaming,
                totalCurrentCost,
                validOriginalItemPrice,
                getStreamingPrice,
                {
                    maxLines: validNumberOfLines,
                    minSavings: -Infinity,
                    requiredLines: validNumberOfLines,
                    excludedProviders: excludedProviders,
                    preferSavings: true // Prioriter besparelse (passende abonnement) frem for ren indtjening
                }
            );

            // Valider resultat før brug
            if (!result || typeof result !== 'object') {
                toast(COPY.error.couldNotFindSolution, 'error');
                return;
            }

            // Valider at cartItems er et array
            if (Array.isArray(result.cartItems) && result.cartItems.length > 0) {
                // Valider at alle cart items har påkrævede properties
                const validCartItems = result.cartItems.filter(item => {
                    if (!item || typeof item !== 'object') return false;
                    if (!item.plan || typeof item.plan !== 'object') return false;
                    if (!item.plan.id) return false;
                    if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;
                    return true;
                });

                if (validCartItems.length === 0) {
                    toast(COPY.error.couldNotFindSolution, 'error');
                    return;
                }

                // Ryd kurv først
                actions.clearCart();

                // Sæt hele cart på én gang
                actions.setCart(validCartItems);

                // Opdater CBB Mix indstillinger hvis nødvendigt
                validCartItems.forEach(item => {
                    try {
                        if (item.cbbMixEnabled === true && item.plan && item.plan.id) {
                            const mixCount = (item.cbbMixCount != null && Number.isInteger(item.cbbMixCount) && item.cbbMixCount >= 2 && item.cbbMixCount <= 8)
                                ? item.cbbMixCount
                                : 2;
                            actions.setCBBMixEnabled(item.plan.id, true);
                            actions.setCBBMixCount(item.plan.id, mixCount);
                        }
                    } catch (e) {
                        // Skip hvis der er fejl ved opdatering af CBB Mix
                    }
                });

                // Vis besked med forklaring
                const validSavings = Number.isFinite(result.savings) ? result.savings : 0;
                const explanation = (result.explanation && typeof result.explanation === 'string')
                    ? result.explanation
                    : 'Løsning fundet';
                toast(COPY.success.foundSolution(explanation), validSavings >= 0 ? 'success' : 'error');
            } else {
                toast(COPY.error.couldNotFindSolution, 'error');
            }
        } catch (error) {
            // Håndter fejl gracefully
            console.error('Fejl ved automatisk valg af løsning:', error);
            toast(COPY.error.couldNotFindSolution, 'error');
        }
    }, [state.selectedStreaming, state.customerMobileCost, state.originalItemPrice, state.numberOfLines, state.existingBrands, state.broadbandCost, actions]);

    return handleAutoSelectSolution;
}
