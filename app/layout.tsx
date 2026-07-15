import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import WhatsAppFloat from "@/components/layout/whatsapp-float";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),

  title: "Palum Dhara | Premium Kangra Tea from the Himalayas",

  description:
    "Authentic Himalayan tea, honey, and preserves delivered directly from Kangra Valley to your home. Small batch. Single origin. Crafted with care.",

  keywords: [
    "Kangra tea",
    "Himalayan tea",
    "orthodox tea",
    "green tea",
    "Palampur tea",
    "Indian tea",
    "premium tea",
  ],

  openGraph: {
    title: "Palum Dhara | From the Living Waters of the Himalayas",
    description:
      "Premium Kangra tea and curated Himalayan pantry delivered to your doorstep.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ivory">
        {/* SiteChrome renders its children on public routes and renders
            nothing on /admin/* (see components/layout/SiteChrome.tsx).
            {children} itself is always rendered either way — this only
            gates the public Navigation/Footer/WhatsAppFloat, so the
            Admin Shell isn't nested inside the marketing site's chrome. */}
        <SiteChrome>
          <Navigation />
        </SiteChrome>
        <div className="flex-1">{children}</div>
        <SiteChrome>
          <Footer />
          <WhatsAppFloat />
        </SiteChrome>
      </body>
    </html>
  );
}
