import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#FFF5F6] text-charcoal border-t border-dusty-rose/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif font-semibold text-gold mb-4">Avirat Jewelers</h2>
            <p className="text-charcoal/70 mb-4">
              Exquisite handcrafted jewelry for those who know exactly what they&apos;re looking at.
            </p>
            <p className="text-charcoal/50 text-sm">
              © {new Date().getFullYear()} Avirat Jewelers. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" aria-label="Go to Home page" className="text-charcoal/70 hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/collections" aria-label="Go to Collections page" className="text-charcoal/70 hover:text-gold transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/about" aria-label="Go to About Us page" className="text-charcoal/70 hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" aria-label="Go to Contact page" className="text-charcoal/70 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-semibold text-gold mb-4">Visit Us</h3>
            <ul className="space-y-2 text-charcoal/70">
              <li>
                <p className="font-medium text-gold">Location</p>
                <p>Shayona Green, Gota, Ahmedabad, Gujarat 382481</p>
              </li>
              <li>
                <p className="font-medium text-gold">Phone</p>
                <p>099795 63076</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dusty-rose/30 mt-8 pt-8 text-center text-charcoal/50 text-sm">
          <p>Crafted with precision and passion for fine jewelry</p>
          <p className="mt-2">
            <a 
              href="https://ktech-dev.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gold font-bold font-sans uppercase tracking-wider text-base hover:text-charcoal transition-colors"
            >
              Made By KTech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
