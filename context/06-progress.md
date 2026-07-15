# Progress

**Status:** Living (updates every session --- never freeze this one)
**Version:** 1.0 **Owner:** Palum Dhara Engineering **Depends on:**
`CLAUDE.md`

**Purpose** --- Living document tracking where the project is right now.
The only doc expected to change frequently.

**Scope** --- Current phase, completed work, work in progress, known
issues, upcoming tasks.

**Contents** --- Phase, done, in progress, issues, next up, last
updated.

**Update Rules** --- Update after every meaningful development session.
Be specific. Be honest. No vague "made progress" entries.

------------------------------------------------------------------------

## Current Phase

Engineering Foundation — Sprints 2.5 (Transactional Commerce) and 2.6 (My Pantry & Admin CMS) are complete.

The project now has:
- A database-backed **Order and OrderItem** schema in Prisma tracking immutable purchase records.
- A beautiful, high-contrast, multi-step customer **Checkout experience** (`/checkout`) with responsive address selection, instant coupon validation, dynamic tax (5% GST), shipping calculations, and final ledger confirmations.
- An automated **First-Order Discount** engine ("WELCOME5") that validates historical user orders and dynamically subtracts welcome price reductions.
- An interactive customer **Order History** tab inside `/account` containing detailed receipt views, order notes, printable invoice sheets, instant "Reorder All" automation, and an elegant visual stepper reflecting fulfillment updates.
- A modern, powerful merchant **Ledger & Fulfillments Console** (`/admin/orders`) with multi-criteria search, status filtering, pagination, and a status transition engine that updates customer order timelines with custom notes.
- A comprehensive customer **"My Pantry" Subscription Dashboard** (`/account?tab=pantry`) allowing users to complete an itemized Setup Wizard, customize subscription contents, skip future deliveries, pause/resume subscription state tracks, adjust item quantities, and view scheduled delivery calendars and historical delivery logs.
- A centralized merchant **Admin Dashboard CMS** (`/app/admin`) featuring fully-secured routes (`requireAdminSession`) enabling full catalog Product creation/curation, Category layout reordering, Collections seasonal grouping, Media Library reusable asset uploading, and automated no-AI-people check confirmations.

## Completed

-   [x] Next.js 16 App Router site scaffolded (TypeScript, Tailwind v4,
    Zustand)
-   [x] Documentation system created (`CLAUDE.md` + `context/`),
    verified against the actual codebase on 12 July 2026
-   [x] `11-database-spec.md` adopted as the engineering implementation
    contract for Sprint 1
-   [x] `decision-log.md` adopted as the authoritative source for
    technical architecture decisions
-   [x] Brand guidelines, UI design system, architecture, and code
    standards documented
-   [x] 10 routes live: home, shop, product detail, subscriptions,
    checkout, journal (+ detail), our-story, faqs, contact
-   [x] Product catalogue (5 products, 4 categories), 4 subscription
    tiers (3 shown in grid + Signature Pantry as a separate featured
    tier), FAQs, journal articles, makers --- all in `lib/data.ts`
-   [x] Cart (Zustand, persisted to `localStorage`)
-   [x] Checkout flow: cart/buy-now → order summary → pre-filled
    WhatsApp message → Cash on Delivery confirmed manually
-   [x] Homepage section order corrected to commerce-first hierarchy
    (Hero → Trust Bar → Shop → Subscriptions → Story → Journal → Makers
    → Testimonials → Newsletter)
-   [x] Subscriptions section layout bug fixed (dead empty grid cell
    removed; Signature Harvest now image-backed)
-   [x] Hero image colour-graded and re-cropped to read as premium food
    branding rather than tourism/landscape photography
-   [x] Four AI-generated "people" images deleted from
    `public/images/story/` --- zero AI-generated people remain in the
    asset library
-   [x] Seven broken image paths in `lib/data.ts` corrected to real
    files
-   [x] Journal cards and Makers section wired to real photography with
    graceful placeholder fallback
-   [x] PostgreSQL (Neon) connected successfully
-   [x] Prisma 5.22 production schema finalized
-   [x] Better Auth-compatible identity schema implemented
-   [x] Initial production migration created and applied
-   [x] Prisma Client generated successfully
-   [x] Database synchronized with production schema
-   [x] **Sprint 2.4 Complete**: Integrated Better Auth client & Next.js API Routes (`/api/auth/*`)
-   [x] **Sprint 2.4 Complete**: Created high-end Account Gateway with personalized community invitation copy
-   [x] **Sprint 2.4 Complete**: Replaced traditional login/register with single-icon `👤` navbar entry and active dropdown states
-   [x] **Sprint 2.4 Complete**: Designed `/account` Dashboard panel containing profile, security, and regional settings
-   [x] **Sprint 2.4 Complete**: Implemented Address table with default flags and fully interactive address CRUD manager
-   [x] **Sprint 2.4 Complete**: Seeded initial database administrator and enabled route verification protection
-   [x] **Sprint 2.5 Complete**: Database-backed Order and OrderItem schemas in Prisma
-   [x] **Sprint 2.5 Complete**: Real-time Checkout DB sync and cart preservation
-   [x] **Sprint 2.5 Complete**: Automated First-Order welcome discounts (₹500 / WELCOME5)
-   [x] **Sprint 2.5 Complete**: Coupon validation, model definitions, and percentage/flat rate calculation engines
-   [x] **Sprint 2.5 Complete**: GST tax-inclusive order totals computation (5% GST)
-   [x] **Sprint 2.5 Complete**: Customer Order Management (Receipt details, visual timeline, reorder automation, printable invoices)
-   [x] **Sprint 2.5 Complete**: Admin Orders Dashboard (Master-Detail, multi-criteria search, status filters, paging, and status updates with timeline notes)
-   [x] **Sprint 2.6 Complete**: Implemented Admin Product Curation (Creation, Editing, Status, weight, prices, FSSAI, and Source & Origin values)
-   [x] **Sprint 2.6 Complete**: Designed Admin Categories CMS (display reordering, slug updates, metadata)
-   [x] **Sprint 2.6 Complete**: Created Admin Collections CMS (Merchandising group curation)
-   [x] **Sprint 2.6 Complete**: Built centralized Media Library resolving prior Sprint 2.3 regression (`Media` and `ProductMedia` join tables)
-   [x] **Sprint 2.6 Complete**: Developed customer "My Pantry" Setup Wizard with interactive selections
-   [x] **Sprint 2.6 Complete**: Built customer Pantry Configuration (Pause/Resume, Skip next delivery, Quantity adjustments)
-   [x] **Sprint 2.6 Complete**: Integrated customer Pantry Schedule Delivery Calendar & Historical delivery ledger tracks

## Work In Progress

-   [ ] Replace placeholder WhatsApp number (`919999999999`) with the
    real business number in `whatsapp-float.tsx` and
    `checkout-content.tsx`
-   [ ] Decide and implement a real newsletter backend --- form
    currently only flips local state, no email is captured (see
    `04-architecture.md`)
-   [ ] Populate `testimonials` array --- `TestimonialSection` component
    exists but currently renders nothing

## Known Issues

-   **No payment gateway.** Checkout is WhatsApp + Cash on Delivery
    only. This is a deliberate current design, not a bug --- but should
    be an explicit decision if online payment is wanted later, not an
    oversight (see `04-architecture.md`).
-   **`eslint.config.mjs` contradicts `05-code-standards.md`.**
    Strict-mode rules (`no-explicit-any`, `no-unused-vars`, etc.) are
    turned off in the actual lint config while the docs say strict mode
    is enabled. Needs a decision: tighten the config, or update the doc.
-   **`next.config.ts` has image optimization disabled**
    (`unoptimized: true`) --- works for now, but is the largest gap
    against the "fast on 3G" performance principle.
-   **`metadataBase` and `.env`'s `DATABASE_URL`** both still hold
    sandbox/localhost values --- must be replaced before any production
    deploy.
-   Several installed dependencies (`next-auth`, `next-intl`, most of
    the Radix/shadcn set, `react-hook-form`, `zod`,
    `@tanstack/react-query`, `@tanstack/react-table`, `recharts`,
    `@dnd-kit/*`, `@mdxeditor/editor`) are not referenced anywhere in
    the app --- likely scaffold leftovers. Audit before the next
    dependency review.

## Next Engineering Sprint

-   [ ] Sprint 2.7 --- Operations (Razorpay Payment gateway, Shipping carrier logistics integration, Transactional emails)
-   [ ] Sprint 2.7 --- Performance Hardening & Devices compatibility testing

## Upcoming Tasks

-   [ ] Decide: formalize WhatsApp+COD as the permanent ordering model,
    or integrate a payment gateway
-   [ ] Real newsletter capture (e.g. Resend, as used on the GHARRAT
    brand) wired to `NewsletterSection`
-   [ ] Populate testimonials with real customer quotes
-   [ ] Set real production domain in `metadataBase`; verify Open
    Graph/social previews
-   [ ] Re-enable strict lint rules or formally relax the code-standards
    doc to match
-   [ ] Dependency audit --- remove or document every unused package
-   [ ] Decide on `next-intl` --- either wire up regional language
    support or remove the dependency
-   [ ] Turn on Next.js image optimization once a hosting target that
    supports it is confirmed
-   [ ] Responsive testing on real devices at 320--1440px
-   [ ] Accessibility audit
-   [ ] Performance benchmarking against the < 2.5s LCP / 4G target

------------------------------------------------------------------------

**Last updated:** 15 July 2026 by AI Agent --- updated post-Sprint 2.6 implementation of My Pantry Subscription Subsystem & Admin CMS Dashboard with successful compilation.
