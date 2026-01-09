import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProviderTabs from './ProviderTabs';

describe('ProviderTabs', () => {
  const defaultProps = {
    activeProvider: 'all',
    onProviderChange: vi.fn(),
    searchQuery: '',
    onSearch: vi.fn(),
    includeBroadband: false,
    onIncludeBroadbandChange: vi.fn()
  };

  it('renders the internet inclusion checkbox when onIncludeBroadbandChange is provided', () => {
    render(<ProviderTabs {...defaultProps} />);
    
    const checkbox = screen.getByLabelText('Internet skal være inkluderet');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('does not render the internet inclusion checkbox when onIncludeBroadbandChange is missing', () => {
    const propsWithoutCallback = { ...defaultProps, onIncludeBroadbandChange: undefined };
    render(<ProviderTabs {...propsWithoutCallback} />);
    
    const checkbox = screen.queryByLabelText('Internet skal være inkluderet');
    expect(checkbox).not.toBeInTheDocument();
  });

  it('calls onIncludeBroadbandChange when checkbox is clicked', () => {
    render(<ProviderTabs {...defaultProps} />);
    
    const checkbox = screen.getByLabelText('Internet skal være inkluderet');
    fireEvent.click(checkbox);
    
    expect(defaultProps.onIncludeBroadbandChange).toHaveBeenCalledWith(true);
  });

  it('shows checkbox as checked when includeBroadband prop is true', () => {
    render(<ProviderTabs {...defaultProps} includeBroadband={true} />);
    
    const checkbox = screen.getByLabelText('Internet skal være inkluderet');
    expect(checkbox).toBeChecked();
  });
});
