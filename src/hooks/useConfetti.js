import confetti from 'canvas-confetti';
import { useCallback } from 'react';

/**
 * Hook for triggering confetti animations.
 * Provides multiple types of celebrations.
 */
export function useConfetti() {

    // A big blast from the bottom
    const fireSuccess = useCallback(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF6D1F', '#00A150', '#ffffff'], // Power Orange, Success Green, White
            zIndex: 9999
        });
    }, []);

    // A prolonged celebration (school pride effect)
    const fireSchoolPride = useCallback(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: ['#FF6D1F', '#ffffff'] };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    }, []);

    return { fireSuccess, fireSchoolPride };
}
