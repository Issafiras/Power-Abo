/**
 * Button - Genbrugelig knap komponent
 * Modern, minimalistisk design med accessibility og micro-interactions
 */

import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../common/Icon';
import { useMagnetic } from '../../hooks/useMagnetic';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...props
}, ref) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    premium: 'btn-premium'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    fullWidth && 'btn-full-width',
    disabled && 'btn-disabled',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  const iconElement = icon && (
    <Icon
      name={icon}
      size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
      className={`icon-inline ${iconPosition === 'right' ? 'icon-spacing-left' : 'icon-spacing-right'}`}
    />
  );

  // Magnetic effect for primary and premium buttons
  const isMagnetic = !disabled && !loading && (variant === 'primary' || variant === 'premium');
  const { magneticRef, magneticX, magneticY, handleMagneticMove, handleMagneticLeave } = useMagnetic(15);

  return (
    <motion.button
      ref={(node) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
        magneticRef.current = node;
      }}
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      style={isMagnetic ? { x: magneticX, y: magneticY } : {}}
      onMouseMove={isMagnetic ? handleMagneticMove : undefined}
      onMouseLeave={isMagnetic ? handleMagneticLeave : undefined}
      {...props}
    >
      {loading && (
        <Icon
          name="loader"
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          className="icon-inline icon-spinning"
        />
      )}
      {!loading && iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {!loading && iconPosition === 'right' && iconElement}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;

