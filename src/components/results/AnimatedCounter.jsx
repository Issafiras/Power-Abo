/**
 * AnimatedCounter komponent
 * Simpel count-up animation uden framer-motion
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function AnimatedCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const displayValueRef = useRef(0);
  const controls = useAnimation();

  useEffect(() => {
    let startTime = null;
    const startValue = displayValueRef.current;
    const endValue = value;

    if (startValue === endValue) return;

    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      displayValueRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        displayValueRef.current = endValue;
        setDisplayValue(endValue);

        // Pop effect when done counting
        controls.start({
          scale: [1, 1.08, 1],
          color: ['var(--text-primary)', 'var(--color-success)', 'var(--text-primary)'],
          transition: { duration: 0.4, ease: "easeOut" }
        });
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration, controls]);

  const formattedValue = decimals === 0
    ? Math.round(displayValue).toLocaleString('da-DK')
    : displayValue.toLocaleString('da-DK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <motion.span
      className={className}
      animate={controls}
      style={{ display: 'inline-block', originX: 0.5, originY: 0.5 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}
