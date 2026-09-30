"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CategoryIntro } from "@/components/CategoryIntro";
import { FilterSortBar, FilterState } from "@/components/FilterSortBar";
import { ProductCard } from "@/components/ProductCard";
import type { ProductJoined } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  
  const { data: categoriesResult } = useSWR('/api/categories', fetcher);
  const category = categoriesResult?.data?.find((cat: { id: string; name: string; slug: string }) => cat.slug === slug);
  const categoryId = category?.id;
  const categoryName = category?.name || "Collection";
  
  const { data: productsResult, isLoading } = useSWR(
    categoryId ? `/api/products?category_id=${categoryId}&sort=created_at&order=desc&limit=50` : null,
    fetcher
  );
  
  const categoryProducts: ProductJoined[] = useMemo(() => productsResult?.data || [], [productsResult?.data]);
  
  const [filters, setFilters] = useState<FilterState>({});

  const filteredProducts = useMemo(() => {
    if (!categoryProducts.length) return [];
    let filtered = [...categoryProducts];

    // Apply metal type filter
    if (filters.metalType) {
      filtered = filtered.filter((p) => (p.material_type || "gold").toLowerCase() === filters.metalType?.toLowerCase());
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

    if (filters.occasion === "offer") {
      filtered = filtered.filter((product) => Boolean(product.offer_id));
    } else if (filters.occasion === "festive") {
      filtered = filtered.filter((product) => Boolean(product.festival_id));
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

    return filtered;
  }, [categoryProducts, filters]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <CategoryIntro 
        category={categoryName} 
        description={`Explore our ${categoryName.toLowerCase()} collection of handcrafted fine jewelry pieces.`} 
      />
      
      <FilterSortBar onFilterChange={setFilters} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
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
            <p className="text-charcoal font-serif text-lg mb-2">No pieces found in this category</p>
            <p className="text-charcoal/60 text-sm mb-6">Explore our full catalogue of curated jewelry.</p>
            <Link href="/collections" className="inline-block px-6 py-2.5 bg-gold text-white font-medium rounded hover:opacity-95 transition-all text-sm">
              View all collections
            </Link>
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

