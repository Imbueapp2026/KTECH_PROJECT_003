"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { ProductJoined } from "@/types";

interface ProductCardProps {
  product: ProductJoined;
  touchZoom?: boolean;
}

export function ProductCard({ product, touchZoom = false }: ProductCardProps) {
  const [isTouching, setIsTouching] = useState(false);
  const imageUrl = product.image_urls?.[0];
  const hasOffer = product.offer && product.offer.is_active;
  const discount = product.offer?.discount;

  const discountedPrice = hasOffer && discount
    ? discount.discount_type === "percentage"
      ? Math.round(product.price * (1 - discount.value / 100))
      : Math.max(0, product.price - discount.value)
    : product.price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="block h-full group"
      onTouchStart={touchZoom ? () => setIsTouching(true) : undefined}
      onTouchEnd={touchZoom ? () => setIsTouching(false) : undefined}
      onTouchCancel={touchZoom ? () => setIsTouching(false) : undefined}
    >
      <div className="relative flex h-full flex-col bg-white rounded-sm overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
        {/* Image container with off-white background */}
        <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden rounded-sm">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-contain p-[12%] transition-transform duration-300 ease-out group-hover:scale-105 ${touchZoom && isTouching ? "scale-110" : ""} ${touchZoom ? "group-active:scale-110" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal/40 text-xs">
              No Image
            </div>
          )}

          {/* Discount / Offer Badge (Top Left) */}
          {hasOffer && discount && (
            <div className="absolute top-2.5 left-2.5 z-10 bg-dusty-rose text-white text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm shadow-sm">
              {discount.discount_type === "percentage"
                ? `${discount.value}% OFF`
                : `₹${discount.value} OFF`}
            </div>
          )}

          {/* Hallmark Certified Badge (Top Right to avoid collision) */}
          {product.hallmark_certified && (
            <div className="absolute top-2.5 right-2.5 z-10 bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-sm shadow-sm">
              Hallmark
            </div>
          )}

          {/* Gold chain-link hairline - appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Product info with generous spacing */}
        <div className="flex flex-1 flex-col px-2 py-3.5">
          <p className="h-[17px] overflow-hidden text-[11px] text-charcoal tracking-widest uppercase mb-1 font-medium line-clamp-1">
            {product.category?.name || "Uncategorized"}
          </p>
          <h3 className="h-[52px] overflow-hidden font-serif text-[16px] font-medium text-charcoal leading-relaxed mb-1.5 line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="mb-2 text-[12px] leading-relaxed text-charcoal/70 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            {hasOffer && discount ? (
              <>
                <span className="text-[12px] text-charcoal/50 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[15px] font-medium text-charcoal">
                  {formatPrice(discountedPrice)}
                </span>
              </>
            ) : (
              <span className="text-[15px] font-medium text-charcoal">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

