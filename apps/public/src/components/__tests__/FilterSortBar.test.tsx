import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSortBar } from '../FilterSortBar';

describe('FilterSortBar Component', () => {
  it('renders search input and responds to user typing', () => {
    const handleFilterChange = vi.fn();
    render(<FilterSortBar onFilterChange={handleFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Bangle' } });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        searchQuery: 'Bangle',
      })
    );
  });

  it('updates metal type and notifies onFilterChange', () => {
    const handleFilterChange = vi.fn();
    render(<FilterSortBar onFilterChange={handleFilterChange} />);

    // Click Filter button to open collapsible filter options
    const toggleButton = screen.getByRole('button', { name: /toggle filters/i });
    fireEvent.click(toggleButton);

    const metalSelect = screen.getByLabelText(/filter by metal type/i);
    expect(metalSelect).toBeInTheDocument();

    fireEvent.change(metalSelect, { target: { value: 'gold' } });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        metalType: 'gold',
      })
    );
  });

  it('closes the filter panel when Escape is pressed', () => {
    render(<FilterSortBar onFilterChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /toggle filters/i }));
    expect(screen.getByLabelText(/filter by metal type/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByLabelText(/filter by metal type/i)).not.toBeInTheDocument();
  });
});
