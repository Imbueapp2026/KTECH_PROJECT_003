"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import type { ProductJoined, Festival } from "@/types";

export function FeaturedFestivalSection() {
  const [festivalProducts, setFestivalProducts] = useState<ProductJoined[]>([]);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<Record<string, number>>({});
  const hoverTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const bannerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (productId: string) => {
    if (!hoverTimersRef.current[productId]) {
      const timer = setInterval(() => {
        setHoveredImageIndex((prev) => {
          const currentIndex = prev[productId] || 0;
          const product = festivalProducts.find((p) => p.id === productId);
          const totalImages = product?.image_urls?.length || 1;
          return {
            ...prev,
            [productId]: (currentIndex + 1) % totalImages,
          };
        });
      }, 1500);
      hoverTimersRef.current[productId] = timer;
    }
  };

  const handleMouseLeave = (productId: string) => {
    if (hoverTimersRef.current[productId]) {
      clearInterval(hoverTimersRef.current[productId]);
      delete hoverTimersRef.current[productId];
      setHoveredImageIndex((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  // Clean up all hover timers on component unmount
  useEffect(() => {
    const currentTimers = hoverTimersRef.current;
    return () => {
      Object.values(currentTimers).forEach((timer) => clearInterval(timer));
    };
  }, []);

  // Fetch festival and products data
  const fetchData = useCallback(async () => {
    setFetchError(false);
    try {
      // First, fetch active festival
      const festivalRes = await fetch("/api/active-festival");

      let currentFestival = null;
      if (festivalRes.ok) {
        const festivalData = await festivalRes.json();
        currentFestival = festivalData.data || null;
        setActiveFestival(currentFestival);
      }

      // Fetch products based on whether festival is active
      let productsRes;
      if (currentFestival) {
        // Festival is active, fetch festival products (includes offer products)
        productsRes = await fetch("/api/festive-products?limit=4");
      } else {
        // No active festival, fetch offer products as fallback
        productsRes = await fetch("/api/offers?limit=4");
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const products = productsData.data || [];
        setFestivalProducts(products);
      } else {
        throw new Error(`Failed to fetch products: ${productsRes.status}`);
      }
    } catch (error) {
      console.warn("Failed to fetch festival data:", error);
      setFestivalProducts([]);
      setFetchError(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Refresh data when page becomes visible (e.g., user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchData]);

  // Periodic refresh to check for new festivals/offers
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchData();
    }, 10000); // Check every 10 seconds for new festivals/offers

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Festival Banner Header */}
        {activeFestival ? (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg">
            <div 
              ref={bannerRef}
              className="relative aspect-[21/9] min-h-[220px] max-h-[420px] w-full overflow-hidden"
            >
              {activeFestival.image_url ? (
                <Image
                  src={activeFestival.image_url}
                  alt={activeFestival.name}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A66B] to-[#8B7355]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="text-xs uppercase tracking-widest text-[#C9A66B] font-semibold mb-1 block">Festive Special</span>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
                  {activeFestival.name}
                </h2>
                {activeFestival.description && (
                  <p className="text-white/90 text-sm md:text-base max-w-2xl font-light">
                    {activeFestival.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg">
            <div className="relative aspect-[21/9] min-h-[220px] max-h-[420px] w-full overflow-hidden bg-gradient-to-r from-[#C9A66B] to-[#8B7355]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="text-xs uppercase tracking-widest text-[#C9A66B] font-semibold mb-1 block">Special Offers</span>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">
                  Current Offers
                </h2>
                <p className="text-white/90 text-sm md:text-base max-w-2xl font-light">
                  {fetchError
                    ? "We couldn't load our offers right now"
                    : festivalProducts.length > 0
                    ? "Explore our exclusive collection with special discounts"
                    : "No offers available"}
                </p>
                {fetchError && (
                  <button
                    type="button"
                    onClick={() => void fetchData()}
                    className="mt-4 rounded border border-white/70 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Festival Products Grid */}
        {festivalProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-7">
            {festivalProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
                onMouseEnter={() => handleMouseEnter(product.id)}
                onMouseLeave={() => handleMouseLeave(product.id)}
              >
                <div className="relative bg-white rounded-sm overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                  {/* Image container with off-white background */}
                  <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden rounded-sm">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <Image
                        src={product.image_urls[hoveredImageIndex[product.id] || 0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain p-[12%] transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/40 text-xs">
                        No Image
                      </div>
                    )}
                    {product.hallmark_certified && (
                      <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-sm shadow-sm">
                        Hallmark
                      </div>
                    )}
                    {/* Gold chain-link hairline - appears on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A66B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Image dots indicator */}
                    {product.image_urls && product.image_urls.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {product.image_urls.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              (hoveredImageIndex[product.id] || 0) === idx ? "bg-[#C9A66B]" : "bg-[#C9A66B]/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Product info */}
                  <div className="px-2 py-3.5">
                    <p className="text-[11px] text-[#6B6560] tracking-widest uppercase mb-1">
                      {product.category?.name || "Jewelry"}
                    </p>
                    <h3 className="font-serif text-[15px] font-medium text-[#2C2C2A] leading-relaxed mb-1.5 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-[15px] font-medium text-[#2C2C2A]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#C9A66B]">
                      {product.offer?.is_active ? "Offer available" : "No offer available"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/collections?offers=active"
            className="inline-block px-8 py-3.5 bg-gold text-white font-medium rounded hover:opacity-95 transition-all shadow-sm border-b-2 border-dusty-rose"
          >
            View Offer Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
