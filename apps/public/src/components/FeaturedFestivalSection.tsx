"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Festival } from "@/types";
import { useAdminData } from "@/hooks/useAdminData";

type OfferBanner = {
  id: string;
  image_url: string;
  alt_text: string;
  offer_id?: string | null;
  product_id?: string | null;
};

const OFFER_CAROUSEL_AUTO_ADVANCE_MS = 5000;

export function FeaturedFestivalSection() {
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [offerBanners, setOfferBanners] = useState<OfferBanner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const pointerStartXRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: adminData, loading: adminLoading } = useAdminData({ realtime: true });

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

      if (!currentFestival) {
        // Use admin sync data for banners if available, otherwise fallback to API
        if (adminData?.banners.products && adminData.banners.products.length > 0) {
          const limitedProducts = adminData.banners.products
            .filter(p => p.is_limited && p.status === "published" && p.availability !== "sold")
            .slice(0, 5);
          
          const bannersFromAdmin: OfferBanner[] = limitedProducts.map(p => ({
            id: p.id,
            image_url: p.image_urls?.[0] || "",
            alt_text: p.name,
            offer_id: null,
            product_id: p.id,
          }));
          
          setOfferBanners(bannersFromAdmin);
          setActiveBannerIndex(0);
        } else {
          const bannerRes = await fetch("/api/offer-banners");
          if (bannerRes.ok) {
            const bannerData = await bannerRes.json();
            setOfferBanners((bannerData.data ?? []).slice(0, 5));
            setActiveBannerIndex(0);
          }
        }
      } else {
        setOfferBanners([]);
      }
    } catch (error) {
      console.warn("Failed to fetch festival data:", error);
      setOfferBanners([]);
      setActiveBannerIndex(0);
      setFetchError(true);
    }
  }, [adminData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Refresh when admin data changes
  useEffect(() => {
    if (adminData && !adminLoading) {
      void fetchData();
    }
  }, [adminData, adminLoading, fetchData]);

  useEffect(() => {
    if (activeFestival || offerBanners.length < 2 || isCarouselPaused) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((index) => (index + 1) % offerBanners.length);
    }, OFFER_CAROUSEL_AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [activeFestival, offerBanners.length, isCarouselPaused]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  function pauseCarousel() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsCarouselPaused(true);
  }

  function resumeCarouselSoon() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsCarouselPaused(false), 2500);
  }

  function moveBanner(direction: -1 | 1) {
    if (offerBanners.length < 2) return;
    setActiveBannerIndex((index) =>
      (index + direction + offerBanners.length) % offerBanners.length,
    );
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    pauseCarousel();
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX !== null && endX !== undefined && Math.abs(endX - startX) > 50) {
      moveBanner(endX < startX ? 1 : -1);
    }
    resumeCarouselSoon();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    pauseCarousel();
    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;
    if (startX !== null && Math.abs(event.clientX - startX) > 50) {
      moveBanner(event.clientX < startX ? 1 : -1);
    }
    resumeCarouselSoon();
  }

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
    <section className="bg-[#FBFAF8] py-10 sm:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Festival Banner Header */}
        {activeFestival ? (
          <div className="mb-10 overflow-hidden shadow-lg">
            <div 
              className="relative aspect-[4/5] sm:aspect-[16/7] min-h-[420px] sm:min-h-[220px] sm:max-h-[420px] w-full overflow-hidden"
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
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10">
                <span className="text-xs uppercase tracking-widest text-[#C9A66B] font-semibold mb-1 block">Festive Special</span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
                  {activeFestival.name}
                </h2>
                {activeFestival.description && (
                  <p className="text-sm sm:text-base text-white/90 max-w-2xl font-light">
                    {activeFestival.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 sm:mb-10">
            <div className="mb-4 flex items-end justify-between gap-4 px-1 sm:mb-6 sm:px-0">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A47B40]">Limited-time edit</p>
                <h2 className="mt-1 font-serif text-2xl text-[#2C2C2A] sm:text-4xl">Current Offers</h2>
              </div>
            </div>
            <div
              className="group relative aspect-[4/3] min-h-[280px] w-full touch-pan-y overflow-hidden bg-gradient-to-r from-[#C9A66B] to-[#8B7355] sm:aspect-[16/7] sm:min-h-[220px] sm:max-h-[420px]"
              onMouseEnter={pauseCarousel}
              onMouseLeave={resumeCarouselSoon}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={resumeCarouselSoon}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={resumeCarouselSoon}
              onPointerLeave={(event) => {
                if (pointerStartXRef.current !== null) handlePointerUp(event);
              }}
            >
              {offerBanners.length > 0 && (
                <div
                  className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
                  style={{ transform: `translate3d(-${activeBannerIndex * 100}%, 0, 0)` }}
                >
                  {offerBanners.map((banner) => (
                    <div key={banner.id} className="relative h-full min-w-full animate-[offerSlideIn_700ms_ease-out] bg-[#FAF8F5]">
                      <Image
                        src={banner.image_url}
                        alt=""
                        fill
                        sizes="100vw"
                        aria-hidden="true"
                        className="scale-105 object-cover blur-xl opacity-70"
                      />
                      <Image
                        src={banner.image_url}
                        alt={banner.alt_text}
                        fill
                        sizes="100vw"
                        priority={banner.id === offerBanners[activeBannerIndex]?.id}
                        className="object-fill"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              {offerBanners.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-5 sm:bottom-7 sm:px-8" aria-label="Offer banner controls">
                  <div className="pointer-events-auto flex gap-2" aria-label="Offer banner slides">
                  {offerBanners.map((banner, index) => (
                    <button
                      key={banner.id}
                      type="button"
                      aria-label={`Show offer ${index + 1}`}
                      aria-current={index === activeBannerIndex ? "true" : undefined}
                      onClick={(e) => { e.preventDefault(); pauseCarousel(); setActiveBannerIndex(index); resumeCarouselSoon(); }}
                      className={`h-2.5 w-2.5 rounded-full border border-white/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] ${index === activeBannerIndex ? "scale-110 bg-white" : "bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                  </div>
                </div>
              )}
              <Link
                href={
                  offerBanners[activeBannerIndex]
                    ? `/collections?offers=active${offerBanners[activeBannerIndex].offer_id ? `&offer_id=${encodeURIComponent(offerBanners[activeBannerIndex].offer_id)}` : ""}`
                    : "/collections?offers=active"
                }
                className="absolute inset-0 z-10 flex flex-col justify-end p-5 pb-7 focus-visible:outline-none sm:p-10 sm:pb-10"
              >
                <div>
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C98F]">Special Offers</span>
                  <p className="max-w-xl text-sm font-light text-white/90 sm:text-base">
                    {fetchError
                      ? "We couldn't load our offers right now"
                      : offerBanners.length > 0
                      ? "Explore exclusive pieces with special pricing"
                      : "No offers available"}
                  </p>
                  <span className="mt-4 inline-flex border-b border-white/80 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">Shop offer</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
