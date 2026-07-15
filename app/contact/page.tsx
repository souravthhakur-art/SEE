import type { Metadata } from "next";
import { MessageCircle, Mail, Phone, Instagram, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Palum Dhara",
  description: "Get in touch with Palum Dhara on WhatsApp, email, or phone. Shipped from Palampur, Himachal Pradesh.",
};

export default function ContactPage() {
  return (
    <>
      <section className="section-padding py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <p className="label mb-4">Get in Touch</p>
          <h1 className="heading-lg mb-6">Contact</h1>
          <p className="body-lg mb-16 max-w-xl">
            We'd love to hear from you. For the fastest response, reach out on WhatsApp. 
            We typically reply within a few hours.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* WhatsApp — Primary */}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 border border-forest/10 hover:border-[#25D366] transition-colors duration-300"
            >
              <MessageCircle className="w-6 h-6 text-[#25D366] mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-forest mb-2">WhatsApp</h3>
              <p className="text-sm text-charcoal/60 mb-3">
                Fastest way to reach us. Ask about products, track orders, or get brewing advice.
              </p>
              <span className="text-sm text-forest group-hover:underline underline-offset-4">
                +91 99999 99999 →
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:hello@palumdhara.com"
              className="group p-8 border border-forest/10 hover:border-forest/30 transition-colors duration-300"
            >
              <Mail className="w-6 h-6 text-forest/60 mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-forest mb-2">Email</h3>
              <p className="text-sm text-charcoal/60 mb-3">
                For bulk orders, partnerships, and press inquiries.
              </p>
              <span className="text-sm text-forest group-hover:underline underline-offset-4">
                hello@palumdhara.com →
              </span>
            </a>

            {/* Phone */}
            <a
              href="tel:+919999999999"
              className="group p-8 border border-forest/10 hover:border-forest/30 transition-colors duration-300"
            >
              <Phone className="w-6 h-6 text-forest/60 mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-forest mb-2">Phone</h3>
              <p className="text-sm text-charcoal/60 mb-3">
                Available Monday to Saturday, 10 AM to 6 PM IST.
              </p>
              <span className="text-sm text-forest group-hover:underline underline-offset-4">
                +91 99999 99999 →
              </span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/palumdhara"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 border border-forest/10 hover:border-forest/30 transition-colors duration-300"
            >
              <Instagram className="w-6 h-6 text-forest/60 mb-4" strokeWidth={1.5} />
              <h3 className="font-heading text-xl text-forest mb-2">Instagram</h3>
              <p className="text-sm text-charcoal/60 mb-3">
                Follow us for harvest updates, behind-the-scenes, and new product launches.
              </p>
              <span className="text-sm text-forest group-hover:underline underline-offset-4">
                @palumdhara →
              </span>
            </a>
          </div>

          {/* Address */}
          <div className="mt-16 p-8 bg-forest/5 border border-forest/10">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-forest/60 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="font-heading text-xl text-forest mb-2">Shipped from Palampur</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  Palum Dhara<br />
                  Near Palampur Tea Gardens<br />
                  Kangra District, Himachal Pradesh<br />
                  India — 176061
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
