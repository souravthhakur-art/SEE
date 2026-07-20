import type { Metadata } from "next";
import "./globals.css";
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
      <body className="min-h-screen bg-ivory">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
