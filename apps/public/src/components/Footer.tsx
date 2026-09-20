import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-serif font-semibold mb-4">Avirat Jewelers</h2>
            <p className="text-white/70 mb-4">
              Exquisite handcrafted jewelry for those who know exactly what they&apos;re looking at.
            </p>
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Avirat Jewelers. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-white/70 hover:text-gold transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-white/70">
              <li>
                <p className="font-medium text-white">Email</p>
                <p>info@aviratjewelers.com</p>
              </li>
              <li>
                <p className="font-medium text-white">Address</p>
                <p>Gujarat, India</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
          <p>Crafted with precision and passion for fine jewelry</p>
        </div>
      </div>
    </footer>
  );
}
