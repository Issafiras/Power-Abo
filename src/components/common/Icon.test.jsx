/**
 * Tests for Icon component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon', () => {
  it('should render an icon', () => {
    const { container } = render(<Icon name="close" />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('✕');
  });

  it('should apply custom size', () => {
    const { container } = render(<Icon name="close" size={24} />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveStyle({ fontSize: '24px' });
  });

  it('should apply custom className', () => {
    const { container } = render(<Icon name="close" className="custom-class" />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass('custom-class');
  });

  it('should return fallback icon for unknown icon names', () => {
    const { container } = render(<Icon name="unknown-icon" />);
    const span = container.querySelector('span');
    // Icon component returns a span with fallback glyph '●' for unknown icons
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('●');
  });
});

