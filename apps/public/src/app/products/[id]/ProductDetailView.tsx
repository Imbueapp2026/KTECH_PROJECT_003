"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatWeight } from "@/lib/utils";
import { InquiryCTA } from "@/components/InquiryCTA";
import { ProductCard } from "@/components/ProductCard";
import type { ProductJoined } from "@/types";

interface ProductDetailViewProps {
  product: ProductJoined;
  relatedProducts: ProductJoined[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const materialType = (product.material_type as "gold" | "silver") || "gold";

  const discount = Array.isArray(product.offer?.discount)
    ? product.offer.discount[0]
    : product.offer?.discount || null;
  const hasOffer = !!(product.offer && discount);
  const imageUrl = product.image_urls?.[0] || null;

  const calculateFinalPrice = () => {
    if (!hasOffer || !discount) return product.price;
    
    if (discount.discount_type === "percentage") {
      return Math.round(product.price * (1 - discount.value / 100));
    } else {
      return Math.max(0, product.price - discount.value);
    }
  };

  const finalPrice = calculateFinalPrice();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/collections"
          className="text-charcoal/80 hover:text-gold mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to collections
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
            {/* Image Section */}
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <span className="text-sm">No image available</span>
                </div>
              )}
              {hasOffer && discount && (
                <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded text-sm font-semibold">
                  {discount.discount_type === "percentage"
                    ? `${discount.value}% OFF`
                    : `₹${discount.value} OFF`}
                </div>
              )}
              {product.hallmark_certified && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">
                  Hallmark Certified
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-charcoal/70 uppercase tracking-wide mb-2">
                  {product.category?.name || "Uncategorized"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mb-2 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      product.availability === "available"
                        ? "bg-green-100 text-green-800"
                        : product.availability === "made_to_order"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.availability === "available"
                      ? "Available"
                      : product.availability === "made_to_order"
                      ? "Made to Order"
                      : "Sold Out"}
                  </span>
                </div>
              </div>

              {/* Material Type Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-charcoal/70 mb-2">Material Type</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg font-medium ${
                    materialType === "gold"
                      ? "bg-gold text-white"
                      : "bg-gray-600 text-white"
                  }`}>
                    {materialType === "gold" ? "Gold" : "Silver"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-charcoal/70 mb-1">Price ({materialType === "gold" ? "Gold" : "Silver"})</p>
                <div className="flex items-baseline gap-2">
                  {hasOffer && discount ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold text-charcoal">
                        {formatPrice(finalPrice)}
                      </span>
                      <span className="text-lg text-charcoal/40 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-charcoal">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal/50 mt-1">
                  Includes {product.gst_percent || 5}% GST
                </p>
              </div>

              {/* Trust & Craft Story Banner */}
              <div className="bg-[#FAF8F5] border-l-4 border-gold p-5 mb-6 rounded-r-lg shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.9L10 1.154l7.834 3.746A1 1 0 0 1 18.5 5.8v6.2c0 3.327-2.316 6.136-5.568 6.845L10 19.845l-2.932-1.0A8.002 8.002 0 0 1 1.5 12V5.8a1 1 0 0 1 .666-.9M10 3.155L3.5 6.26v5.74a6.002 6.002 0 0 0 4.195 5.717L10 18.497l2.305-.78A6.002 6.002 0 0 0 16.5 12V6.26z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs uppercase tracking-wider font-semibold text-charcoal/80 font-serif">Purity & Craftsmanship Guarantee</p>
                </div>
                
                {product.hallmark_certified && (
                  <div className="mb-4 bg-white/60 border border-gold/20 p-3 rounded-md flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0 mt-1 shadow-sm" />
                    <div>
                      <p className="text-xs font-semibold text-charcoal font-serif">Certified BIS Hallmark Assured</p>
                      <p className="text-[11px] text-charcoal/70 leading-relaxed">This precious piece is certified by the Bureau of Indian Standards, assuring the exact karats and purity defined below.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-3 border-t border-charcoal/5">
                  {materialType === "gold" && product.purity_carats && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Purity Scale</span>
                      <span className="font-serif font-medium text-charcoal">{product.purity_carats} Karat Fine Gold</span>
                    </div>
                  )}
                  {materialType === "silver" && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Composition</span>
                      <span className="font-serif font-medium text-charcoal">925 Sterling Silver</span>
                    </div>
                  )}
                  {product.weight_grams && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">
                        {product.net_weight_grams ? "Gross Weight" : "Weight"}
                      </span>
                      <span className="font-serif font-medium text-charcoal">{formatWeight(product.weight_grams)}</span>
                    </div>
                  )}
                  {product.net_weight_grams && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Net Weight</span>
                      <span className="font-serif font-medium text-charcoal">{formatWeight(product.net_weight_grams)}</span>
                    </div>
                  )}
                  {product.certifications && product.certifications.length > 0 && (
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Additional Credentials</span>
                      <span className="font-serif font-medium text-charcoal">{Array.isArray(product.certifications) ? product.certifications.join(', ') : product.certifications}</span>
                    </div>
                  )}
                  {(product.making_charge_type === 'percent' && product.making_charge_percent) && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Making Charges</span>
                      <span className="font-serif font-medium text-charcoal">{product.making_charge_percent}%</span>
                    </div>
                  )}
                  {(product.making_charge_type === 'flat' && product.making_charge_flat) && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-charcoal/60">Making Charges</span>
                      <span className="font-serif font-medium text-charcoal">{formatPrice(product.making_charge_flat)}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide text-charcoal/60">GST (Tax)</span>
                    <span className="font-serif font-medium text-charcoal">{product.gst_percent || 5}% Tax Included</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-sm text-charcoal/70 mb-2">Description</p>
                  <p className="text-charcoal leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Inquiry CTA */}
              <InquiryCTA productId={product.id} buttonText="Ask About This Piece" />
            </div>
          </div>
        </div>

        {/* You may also like section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-serif text-charcoal mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
