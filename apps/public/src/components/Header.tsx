"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoldPriceDisplay } from "./GoldPriceDisplay";

const categories = [
  { name: "Necklaces", slug: "necklaces" },
  { name: "Rings", slug: "rings" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Pendants", slug: "pendants" },
  { name: "Bangles", slug: "bangles" },
  { name: "Anklets", slug: "anklets" },
  { name: "Chains", slug: "chains" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  // On non-home pages, we always want the "scrolled" styling (white background, dark text)
  const isSolidStyle = !isHomePage || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Solidify header on scroll
      setIsScrolled(currentScrollY > 50);
      
      // Auto-hide on scroll-down, reveal on scroll-up
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolidStyle ? "bg-white shadow-md" : "bg-transparent"
      } ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center min-h-[44px]">
            <span className={`text-lg sm:text-2xl font-serif font-semibold tracking-wide ${isSolidStyle ? "text-charcoal" : "text-white"}`}>
              Avirat Jewelers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
            >
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                type="button"
                aria-expanded={isCategoriesOpen}
                aria-haspopup="true"
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className={`text-sm font-medium transition-colors hover:text-gold flex items-center gap-1 cursor-pointer ${
                  isSolidStyle ? "text-charcoal" : "text-white"
                }`}
              >
                Most Shopped Categories
                <svg className="w-4 h-4 transition-transform duration-200" style={{ transform: isCategoriesOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isCategoriesOpen && (
                <div 
                  role="menu"
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      role="menuitem"
                      href={`/collections/${category.slug}`}
                      className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50 hover:text-gold transition-colors"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
            >
              About Us
            </Link>
            
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons, Gold Price Display & Mobile Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Gold Price Indicator */}
            <div className="hidden sm:block">
              <GoldPriceDisplay isScrolled={isScrolled} variant="header" />
            </div>

            <Link
              href="/collections"
              className={`flex items-center justify-center min-h-[44px] min-w-[44px] p-2 transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
              aria-label="Search Collections"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            
            <Link
              href="/contact"
              className={`flex items-center justify-center min-h-[44px] min-w-[44px] p-2 transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
              aria-label="Inquiry / Contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>

            {/* Mobile Menu Button on the far right */}
            <button
              type="button"
              className={`md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 transition-colors hover:text-gold ${
                isSolidStyle ? "text-charcoal" : "text-white"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <nav aria-label="Mobile Navigation" className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-3">
            {/* Gold rate on mobile drawer */}
            <div className="pb-2 border-b border-gray-100">
              <GoldPriceDisplay isScrolled={true} variant="header" className="w-fit" />
            </div>

            <Link
              href="/"
              className="block py-2 text-charcoal font-medium hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            <div className="py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">Most Shopped Categories</p>
              <div className="pl-3 space-y-2 border-l-2 border-gold/30">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/collections/${category.slug}`}
                    className="block py-1 text-sm text-charcoal hover:text-gold transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <Link
              href="/about"
              className="block py-2 text-charcoal font-medium hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            
            <Link
              href="/contact"
              className="block py-2 text-charcoal font-medium hover:text-gold transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}


