"use client";

import { ProductCard } from "./ProductCard";
import type { ProductJoined } from "@/types";

interface NewArrivalsStripProps {
  products: ProductJoined[];
}

export function NewArrivalsStrip({ products }: NewArrivalsStripProps) {
  // Keep promoted products in the offers/festival sections, not New Arrivals.
  const newProducts = products
    .filter((p) => p.status === "published" && !p.offer_id && !p.festival_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (newProducts.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-charcoal mb-8">New Arrivals</h2>
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-charcoal/70">New pieces coming soon</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif text-charcoal mb-8">New Arrivals</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-7">
          {newProducts.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2.5 left-2.5 z-10 bg-[#C98A96] text-white text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm">
                New
              </div>
              <ProductCard product={product} touchZoom />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
