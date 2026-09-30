"use client";

import { useEffect, useState } from "react";

interface FilterSortBarProps {
  onFilterChange: (filters: FilterState) => void;
  initialPriceRange?: string;
}

export interface FilterState {
  metalType?: string;
  priceRange?: string;
  occasion?: string;
  sortBy?: string;
  searchQuery?: string;
}

export function FilterSortBar({ onFilterChange, initialPriceRange = "" }: FilterSortBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    metalType: "",
    priceRange: initialPriceRange,
    occasion: "",
    sortBy: "newest",
    searchQuery: "",
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white border-b py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 w-full md:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                aria-label="Search products"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pl-10 pr-4 text-sm text-black focus:outline-none focus:border-[#C9A66B] focus:ring-1 focus:ring-[#C9A66B] transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle filters"
              className="flex items-center space-x-2 text-charcoal hover:text-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium text-sm md:text-base">Filter</span>
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-charcoal/70 whitespace-nowrap">Sort by:</label>
              <select
                value={filters.sortBy}
                aria-label="Sort products"
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="border border-gray-200 rounded px-2 md:px-3 py-2 text-sm focus:outline-none focus:border-[#C9A66B] min-w-0"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Metal Type</label>
              <select
                value={filters.metalType}
                aria-label="Filter by metal type"
                onChange={(e) => handleFilterChange("metalType", e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">All</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                aria-label="Filter by price range"
                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">All</option>
                <option value="0-50000">Under ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                <option value="500000+">Above ₹5,00,000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Occasion</label>
              <select
                value={filters.occasion}
                aria-label="Filter by occasion"
                onChange={(e) => handleFilterChange("occasion", e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="">All</option>
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="everyday">Everyday</option>
                <option value="festive">Festive</option>
                <option value="offer">On Offer</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
