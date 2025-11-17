/**
 * Card - Genbrugelig kort komponent
 * Modern glassmorphism design med hover effects
 */

import React from 'react';

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
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      ref={ref}
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;

