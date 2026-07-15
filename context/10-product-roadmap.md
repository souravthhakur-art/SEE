# Product Roadmap

**Status:** Frozen (Documentation v1.0)
**Version:** 1.0
**Owner:** Palum Dhara Engineering / Business
**Depends on:** `CLAUDE.md`, `01-project-overview.md`, `06-progress.md`, `07-commerce-rules.md`, `09-admin-blueprint.md`

**Purpose** — The strategic evolution of Palum Dhara, phase by phase. This is not a sprint backlog and not engineering planning — those live in `06-progress.md` (current state) and individual task tracking outside this documentation set. This document answers "what comes next, and why," not "what are we building this week."

**Scope** — Business-level phases from the current live website through to marketplace and mobile. Each phase states objectives, features, dependencies, risks, and exit criteria — not implementation detail.

**Contents** — Current stage, vision, guiding principles, nine phases, future vision, success metrics, open questions.

**Update Rules** — Update only when a phase is completed, reordered, or a genuine strategic decision changes the sequence. Do not update this for routine development progress — that belongs in `06-progress.md`.

---

## Current Stage

**Phase 1 (Website) is functionally complete and in refinement.** See `06-progress.md` for the live, detailed status. In roadmap terms: the storefront exists, is content-complete on static data, and is being hardened before real backend services are added.

## Vision

To become the defining Indian food and lifestyle brand for the next decade — rooted in tradition, designed for today, built for scale (see `01-project-overview.md` → Vision). The roadmap below is the sequence of capability that gets from today's static, WhatsApp-driven storefront to that scale, without ever sacrificing the trust-first hierarchy in `CLAUDE.md`.

## Guiding Principles

- **Commerce is the outcome; trust is the foundation** — per `CLAUDE.md`'s constitution, every phase is sequenced so trust-building capability (traceability, transparent pricing, real fulfillment) is never sacrificed for speed to a new revenue channel.
- **No phase starts before its dependencies are real**, not just documented. A phase whose prerequisites are marked **OPEN DECISION** elsewhere in this document set does not start.
- **Every phase must earn its place** — mirrors the Ponytail principle "every pixel must earn its place" (`CLAUDE.md`) applied at the roadmap level: a phase is scoped in because the business needs it now, not because it's technically interesting.
- **Documentation moves with the product** — each phase that changes architecture, commerce rules, or the admin blueprint updates the relevant document (`04`, `07`, `09`) as part of that phase's exit criteria, not as an afterthought.

---

## Phase 1 — Website

**Status: Live, in refinement.**

**Objectives** — Ship a functional, polished v1 ecommerce experience; establish brand presence; validate product-market fit (see `01-project-overview.md` → Launch Goals).

**Features** — Storefront, product catalogue, subscriptions display, WhatsApp + COD checkout, journal, brand story pages. Full detail in `04-architecture.md` and `06-progress.md`.

**Dependencies** — None (foundational phase).

**Risks** — Manual WhatsApp fulfillment doesn't scale past a certain order volume (see `07-commerce-rules.md` → Orders); image optimization is currently off, which risks the "fast on 3G" principle (`02-brand-guidelines.md`) at real traffic levels.

**Exit Criteria** — Placeholder WhatsApp number replaced, newsletter backend decided, testimonials populated, production domain set (see `06-progress.md` → Work In Progress for the live checklist). This phase doesn't formally "end" — it continues in parallel as refinement — but these items gate confidence to move weight onto Phase 2+.

## Phase 2 — Authentication (COMPLETE — Sprint 2.4)

**Status: Complete**

**Objectives** — Let customers create and access accounts securely, enabling personalized and persistent commerce flows.

**Features** — Sign up / log in via Better Auth, secure session management, middleware route protection, and role attributes mapping.

**Exit Criteria** — Completed in Sprint 2.4.

## Phase 3 — Customer Accounts (COMPLETE — Sprint 2.4)

**Status: Complete**

**Objectives** — Give logged-in customers a centralized dashboard (`/account`) to manage their data, saved details, and preferences.

**Features** — `/account` dashboard panel, multi-address CRUD management, newsletter preference synchronization, and security profile updating.

**Exit Criteria** — Completed in Sprint 2.4.

## Sprint 2.5 — Transactional Commerce & Checkout

**Status: Complete (Sprint 2.5)**

**Objectives** — Transition from manual WhatsApp-only checkouts to fully integrated, database-backed transactions, incorporating personalized promotional workflows.

**Features** — 
- **Database-Backed Orders**: Relational `Order` and `OrderItem` Prisma models synced with users and saved addresses.
- **Integrated Checkout Flow**: Seamless database transaction storage during checkout.
- **Promotions & Coupons**: Robust engine supporting coupon codes, percentage/flat rate discounts, validation cadences, and order-stacking limits.
- **First-Order Discount**: Automated 10% welcome discount for newly registered customer accounts.

**Exit Criteria** — Complete. Customer can checkout, save their order in the database, utilize a verified coupon code, and receive automatic first-order discounts.

## Phase 4 — Admin Dashboard CMS (Sprint 2.6)

**Status: Complete (Sprint 2.6)**

**Objectives** — Let the business operate Palum Dhara without hand-editing `lib/data.ts` (see `04-architecture.md` → "Admin Controls" for the exact current gap).

**Features** — Full blueprint in `09-admin-blueprint.md`: Products, Categories & Collections, Subscriptions, Orders, Customers, Journal, Media Library, Newsletter, Analytics, Settings, Roles & Permissions, Audit Logs, Notifications. Includes migrating the product data model from the current `traceability` shape (estate, elevation, harvest, craft, batch) to the decided Source & Origin shape (Village, District, State, Producer Name, Producer Type, Craft Method) — this migration happens as part of building the Products module, not as a separate pass, since the admin UI and the data shape should change together.

**Exit Criteria** — Complete. Non-technical staff can publish/edit a product, adjust subscription pricing and discounts, and process an order without a code deploy.

## Phase 5 — Subscription Engine: My Pantry Subsystem (Sprint 2.6)

**Status: Complete (Sprint 2.6)**

**Objectives** — Move subscriptions from "a WhatsApp message naming a plan" (today's live behavior, see `07-commerce-rules.md` → Subscriptions) to actual recurring billing and lifecycle management.

**Features** — Renders Setup Wizard for configuration, schedules future delivery calendar, supports pausing/resuming subscription tracks, skipping next delivery, or adjusting item quantities, and logs activity in `PantryHistory`.

**Exit Criteria** — Complete. A customer can subscribe, select items, adjust frequencies, and pause/skip/cancel deliveries dynamically in their dashboard.

## Phase 6 — Journal CMS

**Objectives** — Let content be published without a code deploy, extending the Journal module of Phase 4.

**Features** — Draft/publish workflow, scheduling, author attribution — as scoped in `09-admin-blueprint.md` → Journal.

**Dependencies** — Phase 4 (Admin Dashboard), at least the Journal and Media Library modules.

**Risks** — Low — this is the least contested module in `09-admin-blueprint.md`, with no open decisions attached.

**Exit Criteria** — A non-technical team member can publish a journal article end-to-end without engineering involvement.

## Phase 7 — Operations

**Objectives** — Replace manual, human-run processes with systematic ones: payments, shipping, GST-compliant invoicing.

**Features** — Payment gateway integration (Razorpay — already named as "planned" in `CLAUDE.md`'s Technology Stack); shipping carrier integration and tracking-number generation (currently fully manual, see `07-commerce-rules.md` → Shipping); GST-inclusive invoicing per the pricing model decided in `07-commerce-rules.md` → Pricing (12 July 2026) — rate/HSN correctness still needs CA sign-off before this phase can go live.

**Dependencies** — GST registration status and rate confirmation (explicitly **OPEN DECISION**, needs a CA — see `07-commerce-rules.md`). A shipping partner decision (not yet made).

**Risks** — This phase touches money and tax directly — higher regulatory risk than any other phase. Do not proceed on assumptions; confirm with a CA and a chosen shipping partner before implementation, not during it.

**Exit Criteria** — A customer can pay online, receive a real GST-compliant invoice, and track a real shipment — Cash on Delivery + WhatsApp coordination remains available alongside this, not replaced by it, unless a separate decision is made to sunset it (see `07-commerce-rules.md` → Pricing, Summary item 1 and Orders).

## Phase 8 — Marketplace

**Objectives** — Extend beyond the DTC website into marketplace and wholesale channels (see `01-project-overview.md` → Business Model, "Future" row).

**Features** — Marketplace-specific SKU mapping, wholesale pricing tiers, B2B minimum order quantities.

**Dependencies** — Phases 1–7 complete and stable. `07-commerce-rules.md` explicitly marks this as out of scope for v1 architecture — nothing before this phase should be built anticipating marketplace needs.

**Risks** — Premature marketplace work would violate the sequencing principle above (dependencies must be real, not just documented) — this phase does not start until the DTC business is operationally mature.

**Exit Criteria** — Not yet defined — this phase is intentionally under-specified until Phases 1–7 are complete and real marketplace demand is validated.

## Phase 9 — Mobile App

**Objectives** — Native or wrapped mobile experience, if and when the audience data justifies it.

**Features** — Not yet scoped.

**Dependencies** — Strong evidence from Analytics (Phase 4 module) that mobile web isn't sufficient for the target audience (see `02-brand-guidelines.md` → Audience Principles: "Mobile-first, mobile-only for many" already assumes mobile web, not a native app, is the primary surface).

**Risks** — Building a native app before mobile *web* performance is solved (see `06-progress.md` → Known Issues, image optimization gap) would be solving the wrong problem.

**Exit Criteria** — Not yet defined.

---

## Future Vision

Beyond Phase 9: regional language support (the `next-intl` dependency already sits installed and unused — see `04-architecture.md` → Libraries — pending the decision noted in `06-progress.md`), expanded producer network reflected through the `Fulfilled By` field (`07-commerce-rules.md` → Products), and curated seasonal collections once the Collections data-model question (`09-admin-blueprint.md` → Categories & Collections) is resolved.

## Success Metrics

**[OPEN DECISION]** No specific numeric targets (conversion rate, AOV, subscription retention, LCP benchmark beyond the existing "< 2.5s on 4G" principle in `03-ui-design-system.md`) have been set. This section intentionally does not invent targets — they should come from the business, informed by real Phase 1 traffic data.

## Open Questions

Consolidated, cross-referenced to where each is tracked in detail:

1. Order data model shape — `07-commerce-rules.md` → Orders, blocks Phase 3 and Phase 4's Orders module
2. Collections data model — `09-admin-blueprint.md` → Categories & Collections, blocks Phase 4 and Phase 8 collection features
3. "The Himalayan Pantry" naming/positioning — `07-commerce-rules.md` → Subscriptions, blocks Phase 5 scoping
4. GST registration status and per-product rates — `07-commerce-rules.md` → Pricing, blocks Phase 7
5. Shipping partner selection — `07-commerce-rules.md` → Shipping, blocks Phase 7
6. Roles & Permissions structure — `09-admin-blueprint.md` → Roles & Permissions, blocks parts of Phase 4
7. `next-intl` — wire up or remove — `06-progress.md`, affects Future Vision language support
8. Success metrics and numeric targets — this document, needed before any phase's "done" state can be measured objectively
