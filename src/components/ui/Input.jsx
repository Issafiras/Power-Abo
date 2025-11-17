/**
 * Input - Genbrugelig input komponent
 * Modern design med accessibility og validation states
 */

import React from 'react';
import Icon from '../common/Icon';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  
  const baseClasses = 'input';
  const sizeClasses = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  };
  
  const classes = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    error && 'input-error',
    disabled && 'input-disabled',
    icon && `input-with-icon input-icon-${iconPosition}`,
    fullWidth && 'input-full-width',
    className
  ].filter(Boolean).join(' ');
  
  const iconElement = icon && (
    <Icon 
      name={icon} 
      size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
      className="input-icon"
    />
  );
  
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required" aria-label="required">*</span>}
        </label>
      )}
      <div className="input-container">
        {iconPosition === 'left' && iconElement}
        <input
          ref={ref}
          id={inputId}
          className={classes}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
          aria-required={required}
          {...props}
        />
        {iconPosition === 'right' && iconElement}
      </div>
      {error && (
        <div id={errorId} className="input-error-message" role="alert">
          {error}
        </div>
      )}
      {helperText && !error && (
        <div id={helperId} className="input-helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

