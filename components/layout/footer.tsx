import Link from "next/link";
import { Instagram, MessageCircle, Mail, Phone } from "lucide-react";
import Logo from "@/components/layout/logo";

export default function Footer() {
  return (
    <footer className="relative bg-forest text-ivory/80 overflow-hidden">
      {/* Decorative manuscript vine border across the top — very faint. */}
      <div
        className="absolute top-0 left-0 right-0 h-6 text-gold/25 pointer-events-none"
        style={{
          backgroundImage: "url('/decor/footer-border.svg')",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          backgroundSize: "auto 24px",
        }}
        aria-hidden="true"
      />
      <div className="section-padding pt-14 md:pt-20 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo variant="footer" className="h-10 mb-4" />
            <p className="text-sm text-ivory/60 leading-relaxed max-w-xs">
              Premium Kangra tea and curated Himalayan pantry, delivered from the
              mist-covered slopes of the Dhauladhar range to your doorstep.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-ivory/40 mb-6">Shop</h4>
            <ul className="space-y-3">
              {["Tea", "Honey", "Fruit Preserves", "Traditional Pickles", "Gift Collection"].map((item) => (
                <li key={item}>
                  <Link
                    href="/shop"
                    className="text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-ivory/40 mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "Our Story", href: "/our-story" },
                { label: "FAQs", href: "/faqs" },
                { label: "Contact", href: "/contact" },
                { label: "The Himalayan Pantry", href: "/#pantry" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-ivory/40 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@palumdhara.com"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  hello@palumdhara.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919999999999"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                >
                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                  +91 99999 99999
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/palumdhara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-ivory transition-colors duration-300"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                  @palumdhara
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ivory/40">
            © 2026 Palum Dhara. From the Living Waters of the Himalayas.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-ivory/40">Shipped from Palampur, Himachal Pradesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
