import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[72svh] min-h-[420px] sm:h-screen sm:min-h-[540px] flex items-center justify-center overflow-hidden">
      {/* Background Hero Image with Next.js Image Optimization */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop"
          alt="Fine handcrafted gold and diamond jewelry collection by Avirat Jewelers"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-dusty-rose/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-semibold text-white mb-4 sm:mb-6 tracking-wide drop-shadow-sm leading-tight">
          Timeless Elegance
        </h1>
        <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 font-light max-w-2xl mx-auto leading-relaxed">
          Handcrafted jewelry for those who know exactly what they&apos;re looking at
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center justify-center min-h-[44px] w-full max-w-[220px] px-6 py-3 bg-gold text-white font-medium hover:opacity-95 transition-all shadow-md border-b-4 border-dusty-rose"
        >
          Explore Collections
        </Link>
      </div>
    </section>
  );
}

