/**
 * AnimatedCounter komponent
 * Simpel count-up animation uden framer-motion
 */

import { useEffect, useState, useRef } from 'react';

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

  useEffect(() => {
    let startTime = null;
    const startValue = displayValueRef.current;
    const endValue = value;

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
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formattedValue = decimals === 0 
    ? Math.round(displayValue).toLocaleString('da-DK')
    : displayValue.toLocaleString('da-DK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
