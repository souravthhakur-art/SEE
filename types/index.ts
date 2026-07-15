// ============================================================
// SHARED APPLICATION TYPES
//
// Single source of truth for domain types. Extracted from lib/data.ts
// and lib/cart-store.ts so both layers (and every component) import
// from one place instead of redeclaring the same shape.
// ============================================================

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: "tea" | "honey" | "preserves" | "pickles" | "gifts";
  categoryLabel: string;
  originDistrict: string;
  image: string;
  galleryImages: string[];
  badge?: string;
  shortDescription: string;
  description: string;
  whyWeSelected: string;
  regionStory: string;
  regionImage?: string;
  ingredients: string[];
  attributes?: string[];
  howToEnjoy: string[];
  storage: string;
  shippingNote: string;
  price: number;
  weight: string;
  relatedProducts: string[]; // slugs, not ids
  traceability: {
    harvest: string;
    estate: string;
    elevation: string;
    craft: string;
    batch: string;
  };
  origin: string;
  inStock: boolean;
  isLimited?: boolean;

  // Admin Controls
  featured?: boolean;
  showInShop?: boolean;
  subscriptionEligible?: boolean;
  subscriptionPlans?: string[];
  displayOrder?: number;
  status?: "active" | "draft" | "archived";
}

export interface Category {
  id: string;
  label: string;
  count: number;
}

export interface SubscriptionBox {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  frequency: "Month";
  itemCount: string;
  description: string;
  contents: string[];
  perks: string[];
  badge?: string;
  featured?: boolean;
  ctaText: string;

  // Admin
  isVisible: boolean;
  displayOrder: number;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  product: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  excerpt: string;
  topic: string;
  readTime: string;
  thumbnail?: string;
}

export interface Maker {
  id: string;
  name: string;
  village: string;
  role: string;
  story: string;
  makerImage?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  ogImage?: string;
}

export interface ShopSettings {
  visible: boolean;
  displayOrder: number;
  title: string;
  heading: string;
  description: string;
  searchPlaceholder: string;
  sortOptions: string[];
  emptyState: {
    message: string;
    subMessage: string;
    cta: string;
  };
  seo: SeoConfig;
}

export interface NewsletterConfig {
  visible: boolean;
  heading: string;
  description: string;
  placeholder: string;
  buttonText: string;
}

// ============================================================
// CART
// ============================================================

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  weight: string;
}
