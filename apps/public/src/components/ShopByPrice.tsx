"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type PriceBand = {
  minPrice: number;
  maxPrice: number | null;
  label: string;
  product: {
    id: string;
    name: string;
    image_urls: string[] | null;
  } | null;
};

export function ShopByPrice() {
  const [bands, setBands] = useState<PriceBand[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/price-bands")
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (mounted) setBands((result?.data ?? []).filter((band: PriceBand) => band.product?.image_urls?.[0]));
      })
      .catch(() => {
        if (mounted) setBands([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (bands.length === 0) return null;

  return (
    <section className="bg-[#F8F4F0] py-12 sm:py-16" aria-labelledby="shop-by-price-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A66B]">Find your range</p>
            <h2 id="shop-by-price-heading" className="font-serif text-3xl text-[#6B6560]">Shop By Price</h2>
          </div>
        </div>

        <div className="swipe-scroll flex snap-x snap-mandatory touch-pan-x gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {bands.map((band) => {
            const imageUrl = band.product?.image_urls?.[0];
            if (!imageUrl || !band.product) return null;
            const maxQuery = band.maxPrice === null ? "" : `&maxPrice=${band.maxPrice}`;

            return (
              <Link
                key={`${band.minPrice}-${band.maxPrice ?? "max"}`}
                href={`/collections?minPrice=${band.minPrice}${maxQuery}`}
                className="group relative block min-w-[82vw] snap-start aspect-[4/5] overflow-hidden rounded-xl bg-[#6B6560] shadow-[0_8px_24px_rgba(107,101,96,0.14)] transition duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(107,101,96,0.24)] sm:min-w-0"
              >
                <Image
                  src={imageUrl}
                  alt={band.product.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                  className="object-cover transition duration-300 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-serif text-xl text-white">{band.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/75">Explore pieces</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
