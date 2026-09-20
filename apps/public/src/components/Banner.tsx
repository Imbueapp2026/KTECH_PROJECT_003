"use client";
import Link from "next/link";
import { useState } from "react";

export interface BannerItem {
  id: string;
  type: 'product' | 'category' | 'custom';
  title: string;
  imageUrl: string | null;
  linkUrl: string;
  subtitle?: string;
  badge?: string;
  data?: unknown;
}

interface BannerProps {
  items: BannerItem[];
  columns?: number;
  aspectRatio?: string;
  className?: string;
}

export function Banner({ items, columns = 3, aspectRatio = "16/9", className = "" }: BannerProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set([...prev, itemId]));
  };

  if (!items || items.length === 0) {
    return null;
  }

  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  const gridCols = gridColsMap[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`w-full ${className}`}>
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((item) => {
          const hasImageError = imageErrors.has(item.id);
          
          return (
            <Link
              key={item.id}
              href={item.linkUrl}
              className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div 
                className="relative w-full"
                style={{ aspectRatio }}
              >
                {item.imageUrl && !hasImageError ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">{item.title}</span>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {item.badge && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-amber-500 rounded mb-2">
                      {item.badge}
                    </span>
                  )}
                  <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-gray-200 text-sm line-clamp-1 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
