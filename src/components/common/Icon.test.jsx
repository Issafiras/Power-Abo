/**
 * Tests for Icon component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon', () => {
  it('should render an icon', () => {
    const { container } = render(<Icon name="close" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply custom size', () => {
    const { container } = render(<Icon name="close" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should apply custom className', () => {
    const { container } = render(<Icon name="close" className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('should return null for unknown icon names', () => {
    const { container } = render(<Icon name="unknown-icon" />);
    const svg = container.querySelector('svg');
    // Icon component returns null for unknown icons
    expect(svg).toBeNull();
  });
});

