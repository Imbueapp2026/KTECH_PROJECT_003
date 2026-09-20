"use client";

import { useState, useEffect } from "react";
import { CategoryIntro } from "@/components/CategoryIntro";
import { FilterSortBar, FilterState } from "@/components/FilterSortBar";
import { ProductCard } from "@/components/ProductCard";
import type { ProductJoined } from "shared-types";

export default function CollectionsPage() {
  const [products, setProducts] = useState<ProductJoined[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductJoined[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?sort=created_at&order=desc&limit=50');
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setProducts(result.data);
            setFilteredProducts(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products];

    // Apply metal type filter
    if (filters.metalType) {
      filtered = filtered.filter((p) => (p.material_type || "gold").toLowerCase() === filters.metalType.toLowerCase());
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map((v) => parseInt(v.replace("+", "")));
      if (max) {
        filtered = filtered.filter((p) => p.price >= min && p.price <= max);
      } else {
        filtered = filtered.filter((p) => p.price >= min);
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <CategoryIntro category="All Collections" description="Explore our complete catalogue of handcrafted gold and silver fine jewelry pieces." />
      
      <FilterSortBar onFilterChange={handleFilterChange} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-sm overflow-hidden p-2 shadow-xs border border-gray-100">
                <div className="aspect-square bg-[#FAF8F5] animate-pulse rounded-sm" />
                <div className="px-1 py-3.5 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center max-w-md mx-auto my-8">
            <p className="text-charcoal font-serif text-lg mb-1">No products found</p>
            <p className="text-charcoal/60 text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

