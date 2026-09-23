import Image from "next/image";
import { getAnonClient } from "@/lib/supabase";

export const metadata = {
  title: "About Us | Avirat Jewelers",
  description: "Learn about the heritage, master craftsmanship, and timeless tradition behind Avirat Jewelers in Gujarat.",
};

async function getFeaturedProducts() {
  try {
    const supabase = getAnonClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_urls')
      .eq('status', 'published')
      .neq('availability', 'sold')
      .limit(6);
    
    if (error) {
      console.error('Supabase error fetching products:', error);
      return [];
    }
    
    console.log('Fetched products for About page:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function AboutPage() {
  const products = await getFeaturedProducts();
  
  // Get product images to use in About Us page
  const heroImage = products[0]?.image_urls?.[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&h=1080&fit=crop';
  const heritageImage = products[1]?.image_urls?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=600&fit=crop';
  const craftImage = products[2]?.image_urls?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=600&fit=crop';
  
  console.log('About page images:', { heroImage, heritageImage, craftImage });

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full-bleed image */}
      <section className="relative h-[60svh] min-h-[360px] sm:min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Master artisan crafting luxury jewelry with precision"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-14 sm:pt-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-white mb-3 sm:mb-4 leading-tight">
            Our Story
          </h1>
          <p className="text-base sm:text-lg text-white/90 font-light max-w-xl mx-auto leading-relaxed">
            Decades of Gujarati tradition, honesty, and master craftsmanship.
          </p>
        </div>
      </section>

      {/* First Section - Heritage statement */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-2xl sm:text-3xl font-serif text-charcoal leading-relaxed mb-6 sm:mb-8">
            Avirat Jewelers has spent years building pieces for people in Gujarat who know exactly what they&apos;re looking at.
          </p>
          <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed border-l-4 border-dusty-rose pl-4 sm:pl-6">
            We believe that true luxury lies in transparency and craftsmanship. Every piece we create tells a story of dedication, precision, and an unwavering commitment to quality. Our journey began with a simple vision: to bring honest, beautifully crafted jewelry to those who appreciate the art of fine workmanship.
          </p>
        </div>
      </section>

      {/* Second Section - Gujarat Heritage */}
      <section className="py-12 sm:py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-charcoal mb-4 sm:mb-6">Our Gujarat Heritage</h2>
              <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed mb-4 sm:mb-6">
                Rooted in the rich traditions of Gujarat, our craft draws from centuries of jewelry-making expertise. From the intricate designs of temple jewelry to the contemporary elegance of modern pieces, we honor our heritage while embracing innovation.
              </p>
              <p className="text-lg text-charcoal/80 leading-relaxed">
                Each piece is handcrafted by skilled artisans who have mastered techniques passed down through generations. We work with certified gold and precious materials, ensuring that every creation meets the highest standards of purity and quality.
              </p>
            </div>
            <div className="relative rounded-xl h-80 md:h-96 overflow-hidden shadow-md">
              <Image
                src={heritageImage}
                alt="Traditional Indian jewelry design with intricate goldwork"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Our Craft */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-xl h-80 md:h-96 overflow-hidden order-2 md:order-1 shadow-md">
              <Image
                src={craftImage}
                alt="Handcrafting gold and gemstone ornaments in our workshop"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-charcoal mb-4 sm:mb-6">Our Craft</h2>
              <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed mb-4 sm:mb-6">
                At Avirat Jewelers, we believe that exceptional jewelry is the result of patience, skill, and an unwavering attention to detail. Our artisans spend countless hours perfecting each piece, from the initial design to the final polish.
              </p>
              <p className="text-lg text-charcoal/80 leading-relaxed">
                We use only BIS-certified gold and work with trusted suppliers to ensure the purity of every material. Our making charges are transparent, and we provide complete documentation with every purchase, including hallmarks and purity certificates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

