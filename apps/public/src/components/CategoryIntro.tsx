interface CategoryIntroProps {
  category: string;
  description?: string;
}

const categoryDescriptions: Record<string, string> = {
  necklaces: "Discover our exquisite collection of handcrafted necklaces, from delicate heritage chains to regal statement chokers.",
  rings: "Explore our stunning range of rings, from classic solitaire engagement bands to intricate temple cocktail designs.",
  earrings: "Find the perfect pair of earrings to complement your grace, from diamond studs and daily hoops to majestic chandeliers and jhumkas.",
  bracelets: "Browse our versatile bracelet collection, featuring timeless gold links, tennis silhouettes, and contemporary cuffs.",
  pendants: "Grace your neckline with finely detailed pendants, spiritual motifs, and luminous gemstone centerpieces.",
  bangles: "Celebrate tradition with our hallmarked gold bangles, kadas, and gemstone-studded cuffs handcrafted in Gujarat.",
  anklets: "Delicate and melodious gold and sterling silver payals and anklets crafted for celebration and daily elegance.",
  chains: "Durable and shimmering gold chains in versatile weaves, lengths, and purities crafted for longevity.",
};

export function CategoryIntro({ category, description }: CategoryIntroProps) {
  const normalizedCategory = category.toLowerCase().trim();
  const displayDescription = description || categoryDescriptions[normalizedCategory] || "Explore our master-crafted luxury jewelry collection.";

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-1 block">Avirat Vault</span>
        <h1 className="text-3xl sm:text-4xl font-serif text-charcoal mb-3 capitalize">{category}</h1>
        <p className="text-base sm:text-lg text-charcoal/75 max-w-3xl leading-relaxed">{displayDescription}</p>
      </div>
    </section>
  );
}

