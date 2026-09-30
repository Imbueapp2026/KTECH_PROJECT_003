"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  { name: "Maang Tikka", slug: "maang-tikka", size: "small" as const },
  { name: "Nose Rings", slug: "nose-rings", size: "small" as const },
  { name: "Mangalsutra", slug: "mangalsutra", size: "small" as const },
  { name: "Kamarbandh", slug: "kamarbandh", size: "small" as const },
  { name: "Jhumkas", slug: "jhumkas", size: "small" as const },
  { name: "Haar", slug: "haar", size: "small" as const },
  { name: "Kada", slug: "kada", size: "small" as const },
  { name: "Matha Patti", slug: "matha-patti", size: "small" as const },
  { name: "Choker", slug: "choker", size: "small" as const },
];

export function BentoCategoryGrid({ products }: BentoCategoryGridProps) {
  const [liveCategories, setLiveCategories] = useState<typeof categoryConfig | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/categories", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!mounted || !Array.isArray(result?.data)) return;
        setLiveCategories(result.data.map((category: { name: string; slug: string }) => ({
          name: category.name,
          slug: category.slug,
          size: "small" as const,
        })));
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  // Filter for published products and group by category
  const publishedProducts = products.filter((p) => p.status === "published");
  const configuredCategories = liveCategories ?? categoryConfig;
  
  const categories: CategoryTile[] = configuredCategories.map((config) => {
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

  if (categories.length === 0) return null;

  const totalProducts = publishedProducts.length;
  const featuredCategory = categories[0];

  return (
    <section className="bg-[#F5F2EE] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-7 text-center sm:mb-9">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-1 block">Curated Collections</span>
          <h2 className="text-3xl font-serif text-charcoal">Explore by Category</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[140px]">
          {/* Large anchor tile - Necklaces */}
          <Link
            href={`/collections/${featuredCategory.slug}`}
            className="gold-thread-trace relative bg-gradient-to-br from-charcoal to-black rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all col-span-2 row-span-2 group"
          >
            {featuredCategory.representativeImage ? (
              <div className="absolute inset-0">
                <Image
                  src={featuredCategory.representativeImage}
                  alt={featuredCategory.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#E7E0D9]">
                {!featuredCategory.count && (
                  <span className="rounded-full border border-[#C9A66B]/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B6560]">
                    Coming Soon
                  </span>
                )}
              </div>
            )}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end items-start h-full">
              <span className="text-xs uppercase tracking-widest text-gold font-medium mb-1">Featured Category</span>
              <h3 className={featuredCategory.count ? "text-xl sm:text-2xl md:text-3xl font-serif text-white" : "text-xl sm:text-2xl md:text-3xl font-serif text-[#6B6560]"}>{featuredCategory.name}</h3>
              <p className={featuredCategory.count ? "text-white/80 text-xs sm:text-sm mt-1" : "text-[#6B6560]/70 text-xs sm:text-sm mt-1"}>
                {featuredCategory.count ? `${featuredCategory.count} handcrafted pieces` : "New pieces arriving soon"}
              </p>
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
                <div className="absolute inset-0 flex items-center justify-center bg-[#E7E0D9]">
                  {category.count === 0 && (
                    <span className="rounded-full border border-[#C9A66B]/60 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B6560]">
                      Coming Soon
                    </span>
                  )}
                </div>
              )}
              <div className="relative z-10 p-3 sm:p-4 flex flex-col justify-end items-start h-full">
                <h3 className={category.count ? "text-sm sm:text-base md:text-lg font-serif text-white group-hover:text-gold transition-colors" : "text-sm sm:text-base md:text-lg font-serif text-[#6B6560]"}>{category.name}</h3>
                <p className={category.count ? "text-white/70 text-xs mt-0.5" : "text-[#6B6560]/70 text-xs mt-0.5"}>
                  {category.count ? `${category.count} pieces` : "New pieces arriving soon"}
                </p>
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

