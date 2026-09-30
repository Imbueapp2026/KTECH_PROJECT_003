"use client";

import { useEffect, useState } from "react";
import { NewArrivalsStrip } from "./NewArrivalsStrip";
import { BentoCategoryGrid } from "./BentoCategoryGrid";
import { ShopByPrice } from "./ShopByPrice";
import type { ProductJoined } from "@/types";

export function HomeProductsSection() {
  const [products, setProducts] = useState<ProductJoined[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?sort=created_at&order=desc&limit=100', {
          cache: "no-store",
        });
        if (response.ok) {
          const result = await response.json();
          if (isMounted && result.data) {
            setProducts(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products for home sections:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-100 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-sm overflow-hidden p-2 border border-gray-100">
                <div className="aspect-square bg-[#FAF8F5] animate-pulse rounded-sm" />
                <div className="px-1 py-3.5 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* New Arrivals Strip */}
      <NewArrivalsStrip products={products} />
      
      {/* Bento Category Grid */}
      <BentoCategoryGrid products={products} />

      {/* Independent price-band discovery */}
      <ShopByPrice />
    </>
  );
}
