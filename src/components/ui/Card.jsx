/**
 * Card - Genbrugelig kort komponent
 * Modern glassmorphism design med hover effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { use3DTilt } from '../../hooks/use3DTilt';

const Card = React.forwardRef(({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'card';
  const variantClasses = {
    default: 'card-default',
    elevated: 'card-elevated',
    outlined: 'card-outlined',
    glass: 'card-glass'
  };
  const paddingClasses = {
    none: 'card-padding-none',
    sm: 'card-padding-sm',
    md: 'card-padding-md',
    lg: 'card-padding-lg',
    xl: 'card-padding-xl'
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    paddingClasses[padding] || paddingClasses.md,
    hoverable && 'card-hoverable',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? motion.button : motion.div;
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = use3DTilt({ stiffness: 200, damping: 20 });

  return (
    <Component
      ref={ref}
      className={classes}
      onClick={onClick}
      style={hoverable ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
      onMouseMove={hoverable ? handleMouseMove : undefined}
      onMouseLeave={hoverable ? handleMouseLeave : undefined}
      whileHover={hoverable ? { scale: 1.02, zIndex: 10, boxShadow: "var(--shadow-floating)" } : {}}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      <div style={hoverable ? { transform: "translateZ(20px)" } : {}}>
        {children}
      </div>
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;

