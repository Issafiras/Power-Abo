import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Hook for 3D card tilt effect.
 * @param {Object} springConfig - Framer Motion spring configuration
 * @returns {Object} { rotateX, rotateY, handleMouseMove, handleMouseLeave }
 */
export function use3DTilt(springConfig = { stiffness: 300, damping: 30 }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, springConfig);
    const mouseYSpring = useSpring(y, springConfig);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}
