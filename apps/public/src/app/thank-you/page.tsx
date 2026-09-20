"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({ 
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
});

export default function ThankYouPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div 
        className={`text-center max-w-md transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Gold sparkle/diamond icon */}
        <div className="mb-6">
          <svg 
            className="w-12 h-12 mx-auto text-[#C9A66B]" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        {/* Cursive Thank You */}
        <p className={`${greatVibes.className} text-5xl md:text-7xl text-[#C98A96] mb-4`}>
          Thank You
        </p>

        {/* Gold divider line */}
        <div className="w-24 h-0.5 bg-[#C9A66B] mx-auto mb-6" />

        {/* Brand name */}
        <p className="text-charcoal tracking-[0.3em] uppercase text-sm mb-8">
          Avirat Jewelers
        </p>

        {/* Message */}
        <p className="text-gray-600 leading-relaxed mb-10">
          We&apos;ve received your inquiry and will reach out shortly to help you find the perfect piece.
        </p>

        {/* Back to store button */}
        <Link
          href="/collections"
          className="inline-block border border-[#C9A66B] px-8 py-3 rounded-full text-[#C9A66B] hover:bg-[#C9A66B] hover:text-white transition-all duration-300"
        >
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}
