import { useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

/**
 * Hook for making elements pull slightly towards the mouse on hover.
 * @param {number} magneticPull - How strong the pull is.
 * @returns {Object} { ref, x, y, handleMouseMove, handleMouseLeave }
 */
export function useMagnetic(magneticPull = 15, springConfig = { stiffness: 150, damping: 15, mass: 0.1 }) {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();

        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        x.set((middleX / (width / 2)) * magneticPull);
        y.set((middleY / (height / 2)) * magneticPull);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return {
        magneticRef: ref,
        magneticX: springX,
        magneticY: springY,
        handleMagneticMove: handleMouseMove,
        handleMagneticLeave: handleMouseLeave
    };
}
