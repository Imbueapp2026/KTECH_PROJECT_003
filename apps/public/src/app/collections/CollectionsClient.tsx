"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { CategoryIntro } from "@/components/CategoryIntro";
import { FilterSortBar, FilterState } from "@/components/FilterSortBar";
import { ProductCard } from "@/components/ProductCard";
import type { ProductJoined } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const offersOnly = searchParams.get("offers") === "active";
  const selectedOfferId = searchParams.get("offer_id");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const priceQuery = `${minPrice ? `&minPrice=${encodeURIComponent(minPrice)}` : ""}${maxPrice ? `&maxPrice=${encodeURIComponent(maxPrice)}` : ""}`;

  const { data, isLoading } = useSWR(
    offersOnly
      ? `/api/products?sort=created_at&order=desc&limit=50${selectedOfferId ? `&offer_id=${encodeURIComponent(selectedOfferId)}` : ""}${priceQuery}`
      : `/api/products?sort=created_at&order=desc&limit=50${priceQuery}`,
    fetcher,
  );
  const products: ProductJoined[] = useMemo(() => data?.data || [], [data?.data]);
  
  const [filters, setFilters] = useState<FilterState>({});

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    let filtered = offersOnly
      ? products.filter((product) => Boolean(product.offer_id) && Boolean(product.offer?.is_active))
      : [...products];

    if (offersOnly && selectedOfferId) {
      filtered = filtered.filter((product) => product.offer_id === selectedOfferId);
    }

    if (minPrice && Number.isFinite(Number(minPrice))) {
      filtered = filtered.filter((product) => product.price >= Number(minPrice));
    }
    if (maxPrice && Number.isFinite(Number(maxPrice))) {
      filtered = filtered.filter((product) => product.price < Number(maxPrice));
    }

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
  }, [products, filters, offersOnly, selectedOfferId, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <CategoryIntro
        category={offersOnly ? "Offer Collection" : minPrice || maxPrice ? "Shop By Price" : "All Collections"}
        description={offersOnly
          ? "Explore handcrafted jewelry currently available with special offers."
          : "Explore our complete catalogue of handcrafted gold and silver fine jewelry pieces."}
      />
      
      <FilterSortBar onFilterChange={setFilters} initialPriceRange={minPrice && maxPrice ? `${minPrice}-${maxPrice}` : undefined} />

      {(minPrice || maxPrice) && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[#C9A66B] bg-[#C9A66B]/10 px-3 py-1 text-sm text-[#6B6560]">
            Price: {minPrice ? `₹${Number(minPrice).toLocaleString("en-IN")}` : "Any"} – {maxPrice ? `₹${Number(maxPrice).toLocaleString("en-IN")}` : "Above"}
          </span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
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

