"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface MetalPriceInfo {
  price_per_gram: number;
  updated_at: string;
  previous_price?: number;
  price_decrease_percent?: number | null;
}

interface MetalPricesData {
  gold: MetalPriceInfo;
  silver: MetalPriceInfo;
}

interface GoldPriceDisplayProps {
  variant?: "header" | "card";
  isScrolled?: boolean;
  className?: string;
}

export function GoldPriceDisplay({
  variant = "header",
  isScrolled = false,
  className = "",
}: GoldPriceDisplayProps) {
  const [prices, setPrices] = useState<MetalPricesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchPrices() {
      try {
        const response = await api.get<MetalPricesData>("/api/metal-prices");
        if (isMounted && response) {
          setPrices(response);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Metal prices fetch error:", err instanceof ApiError ? err.message : err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchPrices();
    
    // Poll for updates every 2 minutes
    const interval = setInterval(fetchPrices, 120000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    if (variant === "header") {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] animate-pulse ${
            isScrolled ? "bg-gray-100 text-charcoal/40" : "bg-white/10 text-white/40"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-ping" />
            <span>Gold Rate...</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] animate-pulse ${
            isScrolled ? "bg-gray-100 text-charcoal/40" : "bg-white/10 text-white/40"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300/50 animate-ping" />
            <span>Silver Rate...</span>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!prices) {
    return null;
  }

  const { gold, silver } = prices;

  const goldPricePer10g = gold.price_per_gram * 10;
  const goldHasPrev = gold.previous_price !== undefined && gold.previous_price !== null;
  const goldIncreased = goldHasPrev && gold.price_per_gram > (gold.previous_price || 0);
  const goldDecreased = goldHasPrev && gold.price_per_gram < (gold.previous_price || 0);

  const silverPricePer10g = silver.price_per_gram * 10;
  const silverHasPrev = silver.previous_price !== undefined && silver.previous_price !== null;
  const silverIncreased = silverHasPrev && silver.price_per_gram > (silver.previous_price || 0);
  const silverDecreased = silverHasPrev && silver.price_per_gram < (silver.previous_price || 0);

  if (variant === "header") {
    return (
      <div className={`flex items-center gap-2 flex-wrap sm:flex-nowrap ${className}`}>
        {/* Gold Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-xs transition-all duration-300 border ${
            isScrolled
              ? "bg-gray-50 border-gray-200/80 text-charcoal shadow-2xs"
              : "bg-white/15 border-white/20 text-white shadow-sm"
          }`}
          title={`Live 24K Gold Rate: ₹${gold.price_per_gram.toLocaleString("en-IN")}/g`}
        >
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block ring-1 ring-gold/30" />
            <span className="uppercase tracking-wider font-semibold text-[9px] opacity-80">Gold 24K</span>
          </span>
          <span className="font-bold tracking-tight">
            ₹{goldPricePer10g.toLocaleString("en-IN")}
            <span className="font-normal text-[9px] opacity-75">/10g</span>
          </span>
          {goldIncreased && <span className="text-emerald-500 text-[9px]">▲</span>}
          {goldDecreased && <span className="text-rose-500 text-[9px]">▼</span>}
        </div>

        {/* Silver Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-xs transition-all duration-300 border ${
            isScrolled
              ? "bg-gray-50 border-gray-200/80 text-charcoal shadow-2xs"
              : "bg-white/15 border-white/20 text-white shadow-sm"
          }`}
          title={`Live Silver Rate: ₹${silver.price_per_gram.toLocaleString("en-IN")}/g`}
        >
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block ring-1 ring-gray-300/30" />
            <span className="uppercase tracking-wider font-semibold text-[9px] opacity-80">Silver</span>
          </span>
          <span className="font-bold tracking-tight">
            ₹{silverPricePer10g.toLocaleString("en-IN")}
            <span className="font-normal text-[9px] opacity-75">/10g</span>
          </span>
          {silverIncreased && <span className="text-emerald-500 text-[9px]">▲</span>}
          {silverDecreased && <span className="text-rose-500 text-[9px]">▼</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm ${className}`}>
      {/* Gold Price Card */}
      <div className="flex flex-col">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gold Rate (24K)</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">
            ₹{goldPricePer10g.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-500">/ 10g</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="text-[10px] text-gray-400">
            Updated {new Date(gold.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {goldIncreased && <span className="text-xs text-green-600 font-medium ml-1">↑ Up</span>}
          {goldDecreased && <span className="text-xs text-red-600 font-medium ml-1">↓ Down</span>}
        </div>
      </div>

      {/* Silver Price Card */}
      <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Silver Rate</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">
            ₹{silverPricePer10g.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-500">/ 10g</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          <span className="text-[10px] text-gray-400">
            Updated {new Date(silver.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {silverIncreased && <span className="text-xs text-green-600 font-medium ml-1">↑ Up</span>}
          {silverDecreased && <span className="text-xs text-red-600 font-medium ml-1">↓ Down</span>}
        </div>
      </div>
    </div>
  );
}
