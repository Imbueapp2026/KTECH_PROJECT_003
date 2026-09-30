"use client";

import { ProductCard } from "./ProductCard";
import type { ProductJoined } from "@/types";

interface NewArrivalsStripProps {
  products: ProductJoined[];
}

export function NewArrivalsStrip({ products }: NewArrivalsStripProps) {
  const newProducts = products
    .filter((p) => p.status === "published" && !p.festival_id && p.is_new)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (newProducts.length === 0) {
    return (
      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-charcoal mb-6">New Arrivals</h2>
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-charcoal/70">New pieces coming soon</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Just in</p>
            <h2 className="text-2xl font-serif text-charcoal sm:text-3xl">New Arrivals</h2>
          </div>
          <span className="hidden text-xs text-charcoal/50 sm:block">Latest pieces, selected for you</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
          {newProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} touchZoom />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
