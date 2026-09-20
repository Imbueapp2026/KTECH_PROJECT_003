import { Hero } from "@/components/Hero";
import { HomeProductsSection } from "@/components/HomeProductsSection";
import { FeaturedFestivalSection } from "@/components/FeaturedFestivalSection";
import { TrustSection } from "@/components/TrustSection";

export const metadata = {
  title: "Avirat Jewelers | Fine Handcrafted Gold & Silver Jewelry",
  description: "Exquisite handcrafted gold and diamond jewelry for those who know exactly what they're looking at.",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero - Instant SSR */}
      <Hero />
      
      {/* 2. New Arrivals & Category Bento Grid */}
      <HomeProductsSection />
      
      {/* 3. Featured Festival section */}
      <FeaturedFestivalSection />
      
      {/* 4. TrustSection - Certified Purity */}
      <TrustSection />
    </div>
  );
}

