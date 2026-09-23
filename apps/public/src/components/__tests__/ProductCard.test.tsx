import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { ProductJoined } from '@/types';

describe('ProductCard Component', () => {
  const mockProduct: ProductJoined = {
    id: 'prod-123',
    name: '22K Gold Filigree Necklace',
    description: 'Authentic handcrafted necklace',
    price: 85000,
    category_id: 'cat-1',
    category: {
      id: 'cat-1',
      name: 'Necklaces',
      slug: 'necklaces',
    },
    availability: 'available',
    status: 'published',
    offer_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_urls: ['https://example.com/necklace.jpg'],
    weight_grams: 14.5,
    purity_carats: 22,
    hallmark_certified: true,
  };

  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('22K Gold Filigree Necklace')).toBeInTheDocument();
    expect(screen.getByText(/₹\s?85,000/)).toBeInTheDocument();
    expect(screen.getByText('Hallmark')).toBeInTheDocument();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', '22K Gold Filigree Necklace');
  });

  it('displays fallback when no image is provided', () => {
    const productWithoutImage: ProductJoined = {
      ...mockProduct,
      image_urls: [],
    };

    render(<ProductCard product={productWithoutImage} />);
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('renders discounted price and percentage offer badge', () => {
    const productWithOffer: ProductJoined = {
      ...mockProduct,
      price: 100000,
      offer: {
        id: 'off-1',
        label: 'Diwali Dhamaka',
        description: null,
        is_active: true,
        start_date: null,
        end_date: null,
        discount: {
          id: 'disc-1',
          discount_type: 'percentage',
          value: 10,
        },
      },
    };

    render(<ProductCard product={productWithOffer} />);

    // Offer badge
    expect(screen.getByText('10% OFF')).toBeInTheDocument();

    // Original crossed-out price
    expect(screen.getByText(/₹\s?1,00,000/)).toBeInTheDocument();

    // Discounted price: 100,000 - 10% = 90,000
    expect(screen.getByText(/₹\s?90,000/)).toBeInTheDocument();
  });

  it('renders a truncated description in the catalog card without adding an inline expand control', () => {
    const detailedProduct: ProductJoined = {
      ...mockProduct,
      description: 'A handcrafted necklace with delicate filigree work, heirloom detailing, and a statement silhouette designed for celebrations and everyday elegance.',
    };

    render(<ProductCard product={detailedProduct} />);

    const description = screen.getByText(/A handcrafted necklace with delicate filigree work/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('line-clamp-2');

    expect(screen.queryByRole('button', { name: /read more|show more/i })).not.toBeInTheDocument();
  });
});
