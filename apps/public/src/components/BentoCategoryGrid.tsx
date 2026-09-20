"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductJoined } from "@/types";

interface CategoryTile {
  name: string;
  slug: string;
  count: number;
  representativeImage: string | null;
  size: "large" | "small";
}

interface BentoCategoryGridProps {
  products: ProductJoined[];
}

const categoryConfig = [
  { name: "Necklaces", slug: "necklaces", size: "large" as const },
  { name: "Rings", slug: "rings", size: "small" as const },
  { name: "Earrings", slug: "earrings", size: "small" as const },
  { name: "Bracelets", slug: "bracelets", size: "small" as const },
  { name: "Pendants", slug: "pendants", size: "small" as const },
  { name: "Bangles", slug: "bangles", size: "small" as const },
  { name: "Anklets", slug: "anklets", size: "small" as const },
  { name: "Chains", slug: "chains", size: "small" as const },
];

export function BentoCategoryGrid({ products }: BentoCategoryGridProps) {
  // Filter for published products and group by category
  const publishedProducts = products.filter((p) => p.status === "published");
  
  const categories: CategoryTile[] = categoryConfig.map((config) => {
    const categoryProducts = publishedProducts.filter(
      (p) => p.category?.slug === config.slug
    );
    const representativeImage = categoryProducts[0]?.image_urls?.[0] || null;
    
    return {
      ...config,
      count: categoryProducts.length,
      representativeImage,
    };
  });

  const totalProducts = publishedProducts.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-1 block">Curated Collections</span>
          <h2 className="text-3xl font-serif text-charcoal">Explore by Category</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[140px]">
          {/* Large anchor tile - Necklaces */}
          <Link
            href={`/collections/${categories[0].slug}`}
            className="gold-thread-trace relative bg-gradient-to-br from-charcoal to-black rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all col-span-2 row-span-2 group"
          >
            {categories[0].representativeImage ? (
              <div className="absolute inset-0">
                <Image
                  src={categories[0].representativeImage}
                  alt={categories[0].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2A] to-[#4A4540] opacity-95" />
            )}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end items-start h-full">
              <span className="text-xs uppercase tracking-widest text-gold font-medium mb-1">Featured Category</span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-white">{categories[0].name}</h3>
              <p className="text-white/80 text-xs sm:text-sm mt-1">{categories[0].count} handcrafted pieces</p>
            </div>
          </Link>
          
          {/* Small tiles */}
          {categories.slice(1).map((category) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className="gold-thread-trace relative bg-gradient-to-br from-charcoal to-black rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              {category.representativeImage ? (
                <div className="absolute inset-0">
                  <Image
                    src={category.representativeImage}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3D3A37] to-[#252422]" />
              )}
              <div className="relative z-10 p-3 sm:p-4 flex flex-col justify-end items-start h-full">
                <h3 className="text-sm sm:text-base md:text-lg font-serif text-white group-hover:text-gold transition-colors">{category.name}</h3>
                <p className="text-white/70 text-xs mt-0.5">{category.count} pieces</p>
              </div>
            </Link>
          ))}
          
          {/* View all collections tile */}
          <Link
            href="/collections"
            className="relative bg-gradient-to-br from-gold to-[#A8864B] rounded-lg p-4 flex flex-col justify-center items-center hover:shadow-lg transition-all group text-white"
          >
            <h3 className="text-sm sm:text-base font-serif font-medium mb-1 text-center">View All Collections</h3>
            <p className="text-white/85 text-xs mb-2">{totalProducts} pieces</p>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

