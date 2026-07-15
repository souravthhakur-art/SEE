# Architecture

**Status:** Frozen (Documentation v1.0) — verified against `palum-dhara-final-2026-07-12` on 12 July 2026
**Version:** 1.0
**Owner:** Palum Dhara Engineering
**Depends on:** `CLAUDE.md`, `05-code-standards.md`

**Purpose** — Document the technical architecture exactly as it exists in the codebase. This is the map, not the wishlist.

**Scope** — Folder structure, routing, components, state, data flow, data models, libraries, images, deployment, performance. Coding conventions live in `05-code-standards.md`. UI rules live in `03-ui-design-system.md`.

**Update Rules** — Update whenever the codebase changes. Every claim below was checked against source, not assumed. If a future change makes a line here false, fix the line in the same PR — don't let this document go stale.

---

## Folder Structure (actual)

```
palum-dhara-final-2026-07-15/
├── app/                          # Next.js App Router — pages, actions, and APIs
│   ├── layout.tsx                # Root layout: fonts, Navigation, Footer, WhatsAppFloat
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Design tokens, @theme colors, utility classes
│   ├── not-found.tsx
│   ├── checkout/page.tsx         # Secure transaction Checkout visual wizard
│   ├── contact/page.tsx
│   ├── faqs/page.tsx
│   ├── our-story/page.tsx
│   ├── shop/
│   │   ├── page.tsx              # Catalogue
│   │   └── [slug]/page.tsx       # Product detail
│   ├── subscriptions/page.tsx
│   ├── journal/
│   │   ├── page.tsx              # Journal listing
│   │   └── [id]/page.tsx         # Article detail
│   ├── account/
│   │   ├── page.tsx              # Customer Portal Dashboard (orders and pantry)
│   │   ├── actions.ts            # Customer profile server actions
│   │   └── pantry-actions.ts     # Customer Pantry Subscription engine server actions
│   ├── admin/                    # Secured Internal Admin CMS System
│   │   ├── login/page.tsx        # Secure administrator authentication login
│   │   └── (dashboard)/          # Admin workspace dashboard route group
│   │       ├── analytics/        # Business metrics and order reports
│   │       ├── categories/       # Category curation and display sorting
│   │       ├── collections/      # Curated seasonal merchandising groups
│   │       ├── customers/        # Customer directory and compliance ledger
│   │       ├── journal/          # Journal article publisher CMS
│   │       ├── media/            # Centralized reusable Media library
│   │       ├── newsletter/       # Email subscriber management
│   │       ├── orders/           # Order fulfillment master-detail dashboard
│   │       ├── settings/         # Admin security configuration settings
│   │       └── subscriptions/    # Subscription plans configuration module
│   └── api/
│       └── auth/[...all]/route.ts # Better Auth backend handler endpoints
├── components/
│   ├── layout/                   # Navigation, Footer, CartDrawer, WhatsAppFloat
│   ├── product/                  # ProductCard, ProductGallery, ProductInfo
│   ├── shop/                     # ShopBrowser (client-side filter/sort)
│   ├── subscription/             # SubscriptionSection
│   ├── journal/                  # ArticleCard, JournalSection
│   ├── home/                     # TrustBar, MakersSection, TestimonialSection
│   ├── checkout/                 # CheckoutContent (coupon & address validations)
│   ├── account/                  # PantryTab (Subscription wizard), OrderHistoryTab, SavedAddressesTab
│   ├── admin/                    # AdminOrdersContent, AdminProductForm, MediaSelector, etc.
│   └── ui/                       # Reveal, Ornament, Editorial, FaqAccordion, NewsletterSection
├── lib/
│   ├── data.ts                   # Static catalog products/journal fallback metadata
│   ├── cart-store.ts             # Zustand cart store (persisted)
│   └── utils.ts
├── types/index.ts                # Single source of truth for all domain types
├── prisma/
│   ├── schema.prisma             # Authoritative PostgreSQL relational database models
│   └── migrations/               # Completed migration files (Sprint 2.4 - 2.6)
├── public/images/                # story/, regions/, subscriptions/ + product/hero assets
├── .zscripts/                    # Local dev/build shell scripts (sandbox tooling, not app code)
├── Caddyfile                     # Reverse proxy config: routes :81 → localhost:3000
├── .env                          # DATABASE_URL, BETTER_AUTH_SECRET, etc.
└── components.json               # shadcn/ui config (see "Libraries" below)
```

There is no `src/` directory and no `stores/` directory — the cart store lives directly in `lib/`. This supersedes any earlier folder-structure draft that assumed those paths.

## Routes (actual)

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Hero → Trust Bar → Shop → Subscriptions → Our Name → Why Palum Dhara → Our Regions → Field Notes → Trust Signals → Journal → Makers → Testimonials → Newsletter |
| `/shop` | Catalogue | Client-side filter/sort via `ShopBrowser` |
| `/shop/[slug]` | Product detail | Gallery, info, related products |
| `/subscriptions` | Subscription tiers | Product pricing & tier grid detailing plan details |
| `/checkout` | Order review | Secured checkout computing 5% standard GST, delivery rules, address defaults, first-order promotions, and COD transaction placement |
| `/journal` | Journal listing | |
| `/journal/[id]` | Article detail | |
| `/our-story` | About / brand story | |
| `/faqs` | FAQ accordion | |
| `/contact` | Contact | |
| `/account` | Customer Dashboard | Complete tabbed panels: Orders History (timelines, packing slips, basket rehydration), My Pantry (Setup Wizard, skip, pauses, scheduled deliveries), Saved Addresses, Profile, Security |
| `/sign-in` | Account Entry Gateway | Beautifully styled, unified portal for logging in or signing up ("Join Palum Dhara"). |
| `/admin/login` | Admin Authentication | Administrator entrance verifying session cookies and permissions |
| `/admin/orders` | Admin Orders Ledger | Master-detail interactive fulfillment console (status transitions, tracking entries, packing slip prints) |
| `/admin/products` | Admin Product Curation | Full-stack SKU management, pricing adjustments, digital inventories, FSSAI fields, and Source & Origin values |
| `/admin/categories` | Admin Categories CMS | Layout reordering, name, slug, and details edits |
| `/admin/collections`| Admin Collections CMS | MERCH groupings creation and association |
| `/admin/media` | Admin Media Assets | Reusable file repository supporting upload, delete, and confirmation tags |
| `/admin/analytics` | Business Analytics | Operational reporting (revenues, subscription conversions, top products charts) |

### Authentication Architecture (Better Auth)

The customer entry and authentication systems are fully active. Logged-in customer sessions are managed by **Better Auth** with server-side redirects on `/account` using secure headers. Accounts map directly to the `User` DB table and `role` attributes, supporting customer tiers and administrator routing controls.

## Components (actual)

### Layout
| Component | Purpose |
|---|---|
| `Navigation` | Fixed nav. Links: Shop, Subscriptions (both marked `primary`), Journal, About (`/our-story`), Contact. Features elegant `👤` icon/dropdown menu for user sessions. |
| `Footer` | Site footer |
| `CartDrawer` | Slide-out cart, reads `useCartStore` |
| `WhatsAppFloat` | Fixed floating button, links to `wa.me/919999999999` (placeholder number — replace before launch) |

### Commerce
| Component | Purpose |
|---|---|
| `ProductCard` | Shared retail card, used on home and `/shop` |
| `ProductGallery` / `ProductInfo` | Product detail page |
| `ShopBrowser` | Category filter, search, sort — client component |
| `SubscriptionSection` | 3 tier cards; Signature Harvest tier uses a full-bleed image background |
| `CheckoutContent` | Builds a pre-filled `wa.me` order message from cart or buy-now params |
| `AccountDashboard` | Tabbed wrapper displaying user controls, profile fields, preferences, and addresses. |
| `AddressManager` | Interactive, fluid CRUD interface for managing default/multiple customer addresses. |

### Content
| Component | Purpose |
|---|---|
| `ArticleCard` | Journal card, used on home, `/journal`, and related-articles |
| `JournalSection` | Journal listing wrapper |
| `MakersSection` | Producer/SHG cards |
| `TestimonialSection` | Renders `testimonials` array — **currently empty, so this section renders nothing** (see Data Models) |
| `TrustBar` | Compact trust indicators strip |
| `NewsletterSection` | Email capture form — **local state only, no backend** (see "Newsletter" below) |
| `FaqAccordion`, `Editorial`, `Ornament`, `Reveal` | Shared UI primitives |
| `SignInForm` | Authentication client form for login & registration, styled with spring transitions. |

*Update this table when components are added, removed, or renamed.*

## State Management

- **Server state:** Managed via Server Actions and Prisma ORM query interfaces. Dynamic customer data (auth sessions, saved addresses, orders, pantry subscriptions) and admin curation data (products, categories, collections, orders, media) are fetched, updated, and validated server-side.
- **Local client state:** `useState` for UI concerns (mobile menu, form submitted flags, active tab selections, modal toggles, etc.)
- **Shared client state:** One Zustand store — `useCartStore` in `lib/cart-store.ts`, persisted to `localStorage` under the key `palum-dhara-cart`. This handles storefront checkout cart items.

## Data Flow (actual)

```text
User Interaction (Client Components)
        │
        ▼
Server Actions (app/account/actions.ts, app/account/pantry-actions.ts, app/admin/orders/actions.ts)
        │
        ▼
Prisma ORM (Data Access Layer)
        │
        ▼
PostgreSQL (Neon Cloud Database)
        │
        ▼
Dynamic Content / State Updates propagated back to UI
```

## Order / Checkout Flow (actual — database-backed)

In Sprint 2.5, checkout transitioned from a purely manual WhatsApp link to a secure, database-backed transactional pipeline:
- **Durable Checkout State:** Checkout is a multi-step visual wizard (`/checkout`) validating user addresses, computing standard 5% Indian standard GST, applying delivery fees, and committing transaction details.
- **Prisma Transactions:** Placing an order executes a secure `$transaction` server-side, protecting inventory, applying welcome coupons (`"WELCOME5"`), and validating catalog pricing.
- **WhatsApp Integration:** On order placement success (`/checkout/success`), a WhatsApp deep-link is generated with the order details and tracking reference (`PD-XXXX`) as a fallback confirmation.
- **Transactional Tracking:** Orders have automated histories tracking sequential transitions (`processing` ➔ `packed` ➔ `shipped` ➔ `delivered` ➔ `cancelled`).

## Newsletter (actual — database-backed)

Newsletter subscription captures email addresses, validates input patterns, and persists record rows directly inside the `NewsletterSubscriber` database table.

## Database

Palum Dhara uses **PostgreSQL** hosted on Neon, accessed through **Prisma ORM** as the application's secure data layer.

The schema includes the following primary modules:
- **Authentication (Better Auth):** `User`, `Session`, `Account`, `Verification`
- **Product Curation:** `Product`, `Category`, `Collection`, `CollectionProduct`, `Media`, `ProductMedia`, `ProductSource`, `RelatedProduct`
- **Customer Entities:** `Address`, `NewsletterSubscriber`
- **Transactional Commerce (Sprint 2.5):** `Order`, `OrderItem`, `OrderHistory`, `Coupon`, `PromotionRedemption`, `OrderNotes`
- **Pantry Subsystem (Sprint 2.6):** `Pantry`, `PantryItem`, `PantrySchedule`, `PantryPause`, `PantryDelivery`, `PantryHistory`

Commerce features continue to use static data in `lib/data.ts` until the
Admin System gradually replaces hardcoded content.

This allows database development without disrupting the live storefront.

## Data Models (actual, from `types/index.ts`)

### Product
```typescript
{
  id: string
  slug: string
  name: string
  category: "tea" | "honey" | "preserves" | "pickles" | "gifts"
  categoryLabel: string
  originDistrict: string
  image: string
  galleryImages: string[]
  badge?: string
  shortDescription: string
  description: string
  whyWeSelected: string
  regionStory: string
  regionImage?: string
  ingredients: string[]
  attributes?: string[]
  howToEnjoy: string[]
  storage: string
  shippingNote: string
  price: number
  weight: string
  relatedProducts: string[]       // slugs, not ids
  traceability: {
    harvest: string
    estate: string
    elevation: string
    craft: string
    batch: string
  }
  origin: string
  inStock: boolean
  isLimited?: boolean
  // "Admin Controls" — typed fields only, no admin UI exists to edit them (see below)
  featured?: boolean
  showInShop?: boolean
  subscriptionEligible?: boolean
  subscriptionPlans?: string[]
  displayOrder?: number
  status?: "active" | "draft" | "archived"
}
```

Currently 5 products live in `lib/data.ts`: 2 tea, 1 honey, 1 preserve, 1 pickle.

### SubscriptionBox
```typescript
{
  id: string
  name: string
  subtitle: string
  price: number
  frequency: "Month"
  itemCount: string
  description: string
  contents: string[]
  perks: string[]
  badge?: string
  featured?: boolean
  ctaText: string
  isVisible: boolean
  displayOrder: number
}
```
**4 tiers defined in data**, but the UI splits them into two display groups (verified in `subscription-section.tsx`):
- 3 in the main grid, with display copy overridden by a local `tierCopy` map (data name → UI heading): Essential Pantry → "Everyday Harvest", Family Pantry → "Home Harvest", Seasonal Pantry → "Seasonal Harvest"
- 1 shown separately as a full-width, image-backed featured tier below the grid: Signature Pantry → "Signature Harvest"

If a `06-progress.md` or `07-commerce-rules.md` entry ever says "3 subscription tiers," that's the earlier, incorrect draft — there are 4.

### CartItem
```typescript
{
  id: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
  weight: string
}
```

### Other typed content in `lib/data.ts`
`Category`, `Testimonial` (**array is currently empty — `TestimonialSection` has nothing to render**), `JournalArticle`, `Maker`, `FaqItem`, `ShopSettings`, `NewsletterConfig`.

## "Admin Controls" — fields exist, no admin UI exists

`Product` has `featured`, `showInShop`, `displayOrder`, `status`, etc. These are real, typed fields the components already respect — but there is no admin dashboard, form, or API route anywhere in this codebase to edit them. Today, changing them means hand-editing the object literal in `lib/data.ts`. If a CMS or admin panel is built later, it should write to this same shape (or a database table with this same shape) so no component changes are required.

## Styling & Typography (actual tokens, from `app/globals.css`)

Design tokens are hardcoded CSS custom properties, not the placeholder tokens in earlier drafts of `03-ui-design-system.md`:

```css
--color-forest:       #173728
--color-forest-light: #1E4535
--color-ivory:        #F7F3EC
--color-ivory-dark:   #EDE8DF
--color-charcoal:     #2F2F2F
--color-gold:         #C68C2E
--color-gold-light:   #D4A84B
--color-wood:         #8A6F4F
--color-wood-light:   #B79A73

--font-heading: "Cormorant Garamond", serif   /* loaded via Google Fonts in app/layout.tsx */
--font-body:    "Inter", sans-serif
```

- Utility classes (`.btn-primary`, `.heading-lg`, `.label`, etc.) are defined once in `globals.css` and reused — consistent with the "extract repeated patterns into a component/class" rule in `05-code-standards.md`.
- The body background uses a subtle SVG `feTurbulence` paper-grain texture at ~3% opacity — an intentional, documented brand decision, not an accident.
- Ornamental botanical line-art (`Creeper`, `LeafBullet` in `components/ui/ornament.tsx`) is the actual implementation of the Pahari design language described in `02-brand-guidelines.md` — kept under ~7% opacity, atmospheric rather than decorative.

Update `03-ui-design-system.md`'s colour/typography sections to reference these exact values rather than generic "warm earth tones" placeholders.

## Libraries Actually Installed

Only libraries confirmed present in `package.json` and used somewhere in the code are listed as "in use." Several dependencies are installed but currently unused — flagged below rather than silently treated as active architecture.

| Library | Status | Notes |
|---|---|---|
| Next.js 16 (App Router) | In use | |
| React 19 | In use | |
| TypeScript | In use | |
| Tailwind CSS v4 | In use | |
| Zustand (+ `persist`) | In use | Cart store only |
| lucide-react | In use | Icons |
| framer-motion | In use | Via `Reveal` primitives |
| better-auth | **In use** | Authentication service engine, active routing and security. |
| Prisma + `@prisma/client` | **In use** | Mapped to Neon database, active for session identity and saved addresses. |
| next-intl | **Installed, not used** | No i18n routing configured despite `02-brand-guidelines.md`'s "regional readiness" principle |
| shadcn/ui + full Radix set | **Installed, mostly unused** | `components.json` present; only a handful of primitives (`Accordion`, etc.) are visibly used — most of the Radix packages in `package.json` have no importing file |
| react-hook-form, zod, @tanstack/react-query, @tanstack/react-table, recharts, @dnd-kit/*, @mdxeditor/editor | **Installed, not used** | Likely scaffold leftovers from the starter template — candidates for removal per the Ponytail "every dependency must justify its existence" rule |

**Action for next cleanup pass:** audit and remove genuinely unused packages, or document what each is reserved for (e.g. `react-hook-form` + `zod` are the obvious pairing for a future real newsletter/checkout form).

## Image Handling

- `next.config.ts` sets `images: { unoptimized: true }` — Next's built-in image optimization is currently **off**. This trades LCP performance for simpler static hosting; revisit before the "LCP < 2.5s on 4G" target in `03-ui-design-system.md` is verified.
- Real photography lives under `public/images/{story,regions,subscriptions}/` plus root-level hero/product files.
- Per `PROJECT_CONTEXT.md`, four AI-generated "people" images were deliberately deleted from `public/images/story/` (SHG women, tea-garden plucking, honey harvest, tea-leaves-hands) — this enforces the "never use AI-generated images of people" rule in `CLAUDE.md` at the asset level, not just the policy level.
- Journal thumbnails and maker photos currently point at landscape/product/still-life stand-ins, not final documentary photography — see `06-progress.md`.

## Deployment (actual)

- `Caddyfile` reverse-proxies `:81` → `localhost:3000` (with a query-param override for alternate ports). This indicates a containerized/sandboxed hosting setup, not a confirmed production target (e.g. Vercel).
- `.zscripts/` (`dev.sh`, `build.sh`, `start.sh`, `mini-services-*.sh`) are sandbox dev-environment scripts, not part of the shipped application.
- No CI/CD config (GitHub Actions, Vercel config, etc.) exists in this archive.
- `next.config.ts` and `.env` currently contain sandbox-local values (`localhost:3000` metadataBase, a `/home/z/my-project/...` `DATABASE_URL`) that must be replaced with real production values before go-live.

## Known Deviations from `05-code-standards.md`

Documenting these here rather than silently living with the mismatch, per `CLAUDE.md`'s "flag it, don't silently diverge" rule:

- `eslint.config.mjs` explicitly turns **off** `@typescript-eslint/no-explicit-any`, `no-unused-vars`, `no-non-null-assertion`, and `ban-ts-comment` — while `05-code-standards.md` states "Strict mode enabled — no `any`, no implicit `any`." Either re-enable these lint rules, or update the code standards doc to reflect the current relaxed configuration. Don't leave the two contradicting each other.
- `components.json` (shadcn config) points its CSS path at `src/app/globals.css`, but the actual file is at `app/globals.css` (no `src/`). Likely a stale scaffold artifact — harmless unless someone runs a `shadcn add` command, at which point it will fail or write to the wrong path.

## Performance Notes (actual, not aspirational)

- No third-party analytics or tracking scripts currently present.
- `metadataBase` in `app/layout.tsx` is hardcoded to `http://localhost:3000` — this must be set to the real domain before launch, or Open Graph/social preview images will resolve incorrectly.
- Image optimization is off (see above) — this is the single biggest gap against the "Performance over polish" principle in `02-brand-guidelines.md` for a 3G/budget-phone audience.
