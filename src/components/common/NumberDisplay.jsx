/**
 * NumberDisplay komponent
 * Viser tal med monospace font, currency ikoner og forbedret hierarki
 */

import { formatCurrency } from '../../utils/calculations';
import Icon from './Icon';

function NumberDisplay({ 
  value, 
  size = 'base', 
  color = 'primary',
  showIcon = false,
  iconPosition = 'before',
  suffix = '',
  prefix = '',
  className = '',
  ...props 
}) {
  // Handle negative values properly - if prefix is "-" we use positive value
  const displayValue = prefix === '-' ? Math.abs(value) : value;
  const formattedValue = typeof displayValue === 'number' ? formatCurrency(Math.abs(displayValue)) : displayValue;
  
  const sizeClasses = {
    xs: 'number-display--xs',
    sm: 'number-display--sm',
    base: 'number-display--base',
    lg: 'number-display--lg',
    xl: 'number-display--xl',
    '2xl': 'number-display--2xl',
    '3xl': 'number-display--3xl',
    '4xl': 'number-display--4xl',
    '5xl': 'number-display--5xl'
  };

  const colorClasses = {
    primary: 'number-display--primary',
    secondary: 'number-display--secondary',
    success: 'number-display--success',
    danger: 'number-display--danger',
    warning: 'number-display--warning',
    orange: 'number-display--orange'
  };

  const classes = [
    'number-display',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {showIcon && iconPosition === 'before' && (
        <Icon name="wallet" size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 20} className="number-display__icon" aria-hidden="true" />
      )}
      {prefix && <span className="number-display__prefix">{prefix}</span>}
      <span className="number-display__value">{formattedValue}</span>
      {suffix && <span className="number-display__suffix">{suffix}</span>}
      {showIcon && iconPosition === 'after' && (
        <Icon name="wallet" size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 20} className="number-display__icon" aria-hidden="true" />
      )}
      
      <style>{`
        .number-display {
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
          font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
          line-height: 1;
          white-space: nowrap;
        }

        .number-display__value {
          font-weight: var(--font-bold);
        }

        .number-display__icon {
          flex-shrink: 0;
          opacity: 0.7;
        }

        .number-display__prefix,
        .number-display__suffix {
          font-weight: var(--font-normal);
          opacity: 0.8;
        }

        /* Sizes */
        .number-display--xs {
          font-size: var(--font-xs);
        }

        .number-display--sm {
          font-size: var(--font-sm);
        }

        .number-display--base {
          font-size: var(--font-base);
        }

        .number-display--lg {
          font-size: var(--font-lg);
        }

        .number-display--xl {
          font-size: var(--font-xl);
        }

        .number-display--2xl {
          font-size: var(--font-2xl);
        }

        .number-display--3xl {
          font-size: var(--font-3xl);
        }

        .number-display--4xl {
          font-size: var(--font-4xl);
        }

        .number-display--5xl {
          font-size: var(--font-5xl);
        }

        /* Colors */
        .number-display--primary {
          color: var(--text-primary);
        }

        .number-display--secondary {
          color: var(--text-secondary);
        }

        .number-display--success {
          color: var(--color-success);
        }

        .number-display--danger {
          color: var(--color-danger);
        }

        .number-display--warning {
          color: var(--color-warning);
        }

        .number-display--orange {
          color: var(--color-orange);
        }

        /* Responsive - større på desktop */
        @media (min-width: 901px) {
          .number-display--2xl {
            font-size: calc(var(--font-2xl) * 1.2);
          }

          .number-display--3xl {
            font-size: calc(var(--font-3xl) * 1.2);
          }

          .number-display--4xl {
            font-size: calc(var(--font-4xl) * 1.2);
          }

          .number-display--5xl {
            font-size: calc(var(--font-5xl) * 1.2);
          }
        }
      `}</style>
    </span>
  );
}

export default NumberDisplay;

