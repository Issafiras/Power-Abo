/**
 * Tests for Cart component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Cart from './Cart';

// Mock Icon component
vi.mock('./common/Icon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`}>{name}</span>
}));

describe('Cart', () => {
  const mockCartItems = [
    {
      plan: {
        id: '1',
        name: 'Test Plan',
        provider: 'telenor',
        price: 299
      },
      quantity: 1
    }
  ];

  const defaultProps = {
    cartItems: [],
    onUpdateQuantity: vi.fn(),
    onRemove: vi.fn(),
    selectedStreaming: []
  };

  it('should render empty cart message when cart is empty', () => {
    render(<Cart {...defaultProps} />);
    expect(screen.getByText(/kurven er tom/i)).toBeInTheDocument();
  });

  it('should render cart items when cart has items', () => {
    render(<Cart {...defaultProps} cartItems={mockCartItems} />);
    expect(screen.getByText(/Test Plan/i)).toBeInTheDocument();
  });
});

