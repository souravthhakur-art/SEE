# Admin Blueprint

**Status:** Draft — pricing/tax/discount model and Source & Origin product model decided (12 July 2026); several modules still open
**Version:** 0.3
**Owner:** Palum Dhara Engineering / Business
**Depends on:** `CLAUDE.md`, `04-architecture.md`, `07-commerce-rules.md`

**Purpose** — Describe the future Admin System as a business blueprint: what the business needs to operate Palum Dhara without touching code. This is not implementation, not a database schema, not an API spec, not React — it is what the Head of Product would hand to an engineering team before design begins.

**Scope** — Admin philosophy, navigation, and every module the business will eventually need: products, categories, collections, subscriptions, orders, customers, journal, media, newsletter, analytics, settings, roles, permissions, audit logs, notifications.

**Contents** — Philosophy, navigation, dashboard, module-by-module blueprint, roles & permissions, audit logs, notifications, future modules, open decisions.

**Update Rules** — Update when a business decision about *what the admin must do* changes. Do not add implementation detail (field types, database tables, endpoints) — that belongs in a future implementation spec, not here. Do not invent business rules; mark unresolved items **OPEN DECISION**.

---

## Admin Philosophy

The admin exists so the business can operate Palum Dhara without editing `lib/data.ts` or redeploying — see `04-architecture.md` → "Admin Controls" for the current gap this closes.

It is deliberately **not** a copy of Shopify, WooCommerce, or WordPress. Those tools are built for every possible ecommerce business; Palum Dhara's admin is built for exactly one. Principles, following `CLAUDE.md`'s hierarchy (Trust → Business Goal → Brand → UX → Performance → Engineering Convenience):

- **Minimal** — if a field or module isn't needed to run the actual business, it doesn't exist yet. No speculative configuration screens.
- **Fast** — the person using this is often standing in a warehouse or answering WhatsApp, not sitting through a dashboard tutorial.
- **Focused** — one clear way to do each task, not three flexible ways.
- **Indian** — currency, tax, and language assumptions are Indian-first, not adapted from a US-built template (see `02-brand-guidelines.md` → Brand Philosophy).
- **Operationally efficient** — every module should reduce a manual step that's currently done in `lib/data.ts`, a spreadsheet, or a WhatsApp thread. If a module doesn't do that, question whether it's needed yet.

## Navigation

Top-level sections, in the order they matter operationally (products and orders first — commerce before configuration, per `CLAUDE.md`'s constitution):

1. Dashboard
2. Orders
3. Products
4. Categories & Collections
5. Subscriptions
6. Customers
7. Journal
8. Media Library
9. Newsletter
10. Analytics
11. Settings

Roles, Permissions, and Audit Logs live under Settings, not as top-level items — they're configuration-of-the-admin-itself, not day-to-day operational tools.

## Dashboard

The landing screen after login. Shows what needs attention today, not vanity metrics:

- Orders awaiting confirmation (WhatsApp orders not yet marked processed — see Orders below)
- Low-stock alerts (from the `Low Stock Alert` threshold — see `07-commerce-rules.md` → Products)
- New subscription sign-ups
- New newsletter sign-ups (once a real backend exists — see `06-progress.md`)
- Draft products not yet published

**[OPEN DECISION]** Exact dashboard widget set and priority order — needs input from whoever will use it daily.

## Products

Implements the field set decided in `07-commerce-rules.md` → Products (12 July 2026). The admin must let a non-technical user configure, per product:

**Content (already live in `lib/data.ts` today):**
Name, slug, category, short/long description, "why we selected it," region story, ingredients, how-to-enjoy steps, storage instructions, shipping note, gallery images, weight, related products.

**Source & Origin (currently live as the old `traceability` shape — estate, elevation, harvest, craft, batch — being replaced per `07-commerce-rules.md` §8):**
Village, District, State, Producer Name, Producer Type (SHG / Farm / Cooperative / Estate), Craft Method (optional). This is a curator-appropriate model, not an estate-level one — it doesn't ask for detail Palum Dhara doesn't actually have or can't verify. See `07-commerce-rules.md` → Source & Origin for the full reasoning.

**Commercial & compliance (newly decided, not yet built):**
SKU, HSN Code, GST Rate, Tax Inclusive/Exclusive, MRP, Selling Price, Cost Price, Stock (numeric), Low Stock Alert threshold, Shelf Life, Batch Number, **Fulfilled By** (Palum Dhara / SHG / Farmer Collective / Partner Producer), Harvest Date, Packed Date, Best Before, FSSAI License Reference where applicable.

**Publishing controls (already typed, no UI today — see `04-architecture.md`):**
Featured, Show in Shop, Subscription Eligible + which plans, Display Order, Status (Active / Draft / Archived).

The `Fulfilled By` field exists specifically so Palum Dhara can expand beyond its initial producer relationships without a data-model redesign later — every product names who actually packs and ships it, distinct from Source's `Producer Name`, which names who grew or made it.

**No completeness score, health meter, or gamified progress indicator.** If a product is missing required data, the admin surfaces it as a plain, specific flag — `Missing Image`, `Missing GST Rate`, `Missing Source` — not a percentage, badge, or score. This is an operational checklist, not a SaaS onboarding pattern (see Admin Philosophy above: minimal, focused, not borrowed from templates built for a different kind of business).

**[OPEN DECISION]** What happens on the storefront when `Status` is set to `Archived` — see `07-commerce-rules.md` → Products. The admin's "discontinue product" action can't be designed until this is answered.

## Categories & Collections

- **Categories**: Tea, Honey, Fruit Preserves, Traditional Pickles are live; `Gifts` is defined but empty (see `07-commerce-rules.md` → Categories & Collections). Admin must allow adding/reordering categories without a code change.
- **Collections**: no `Collection` concept exists yet in the data model. **[OPEN DECISION, carried from `07-commerce-rules.md`]** — whether a seasonal/festive collection (e.g. a Diwali gift set) is a new type that bundles existing product `id`s, or simply a new category value. The admin blueprint can't specify a Collections module until this is decided, since the two options require different admin screens entirely.

## Subscriptions

Implements the model decided in `07-commerce-rules.md` → Subscriptions (12 July 2026). Per plan, the admin configures:

| Field | Notes |
|---|---|
| Plan Name | e.g. "Essential Pantry" |
| Base Value | MRP of the contents |
| Selling Price | Actual charged price |
| Discount Percentage | Business default, editable — see below |
| Discount Label | e.g. "Save 15%" |
| Featured | Controls whether it renders as the full-width tier (today's "Signature Harvest" treatment) or in the standard grid |
| Active / Inactive | Controls storefront visibility |
| Display Order | |

Current business-default discount percentages (editable, not fixed — see `07-commerce-rules.md`): Starter-tier (~₹500) ≈ 5%, Standard-tier (~₹1,000) ≈ 10%, Premium-tier (~₹1,500) ≈ 15%. The admin must allow these to be changed entirely, and allow new plans with entirely different discount structures — the current three-tier default is a starting point, not a ceiling on how many tiers can exist (today there are four live tiers; see `04-architecture.md`).

**[OPEN DECISION, carried from `07-commerce-rules.md`]** Whether "The Himalayan Pantry" (the FAQ's future waitlist program) is the same thing as these tiers or a separate program determines whether Subscriptions needs one admin module or two.

**[OPEN DECISION]** Renewal cadence, failed/skipped-month handling, and how a "swap any item" request is actually processed — all undefined beyond marketing copy (see `07-commerce-rules.md` → Subscriptions). No admin screen for subscription *lifecycle management* (as opposed to plan *configuration*) can be designed until this is answered.

## Orders

Today an order is a WhatsApp message with no system record at all (see `07-commerce-rules.md` → Orders). At minimum, the admin needs a way to:

- See a list of orders placed (even if manually logged from WhatsApp, until a real `Order` model exists)
- Mark an order's status (received → confirmed → shipped → delivered)
- Record whether COD payment was collected
- Attach a tracking reference, once a shipping partner is chosen (see `07-commerce-rules.md` → Shipping)

**[OPEN DECISION, carried from `07-commerce-rules.md`]** The actual `Order` data model doesn't exist yet — this module can't be spec'd in detail until it does. This blueprint only establishes that Orders is a required top-level module, not its field-level shape.

## Customers

- View customer contact details collected through orders/subscriptions (name, phone, address — see `CLAUDE.md` → DPDP Act compliance; store nothing beyond what's operationally necessary)
- Apply a **Member Discount** manually or via configured rule (see `07-commerce-rules.md` → Pricing discount engine) — never automatic for every logged-in user
- View order history per customer, once Orders has a real data model

**[OPEN DECISION]** Whether customer accounts (`/account`, `/account/orders` — see `01-project-overview.md`) launch before or after the admin panel. If accounts come first, this module needs customer-facing account-management context; if the admin comes first, this module is internal-only.

## Journal

- Create/edit/publish articles (title, body, images, author, publish date)
- Draft vs. published state
- Reorder or feature articles on `/journal` and the homepage Journal section

No open decisions here — this is a standard CMS-style module with no unresolved business questions attached.

## Media Library

- Central place to upload and manage product photography, journal images, and story imagery
- Must enforce the `CLAUDE.md` rule against AI-generated images of people at the point of upload where practical (e.g. a confirmation checkbox: "This image contains no AI-generated people") — the current process of manually auditing and deleting such images (see `06-progress.md`) should not have to repeat itself once the media library exists

## Newsletter

- View/export captured email addresses, once a real backend exists (see `06-progress.md` — currently the form captures nothing)
- No admin action is needed to trigger sends until a provider (e.g. Resend, as used on GHARRAT) is chosen — see `04-architecture.md` → Newsletter

## Analytics

- Order volume, revenue, top products, subscription conversion — standard operational reporting
- **[OPEN DECISION]** No analytics tooling (even third-party, e.g. an embedded dashboard) is currently installed (`04-architecture.md` confirms no analytics scripts exist today). Whether Analytics is a native admin module or an embed of a third-party tool is undecided.

## Settings

- Business details (WhatsApp number, address, GST registration details once available)
- Shipping rules (dispatch window, free-delivery threshold — currently ₹1,000, see `07-commerce-rules.md`)
- Roles, Permissions, Audit Logs, Notifications (below)

## Roles & Permissions

**[OPEN DECISION]** No role structure has been decided yet. A reasonable starting shape — **not yet approved, offered only as a starting point for discussion**:

| Role | Scope (proposed) |
|---|---|
| Owner | Full access, including Settings and Roles |
| Operations | Products, Orders, Customers — no Settings access |
| Content | Journal, Media Library — no commerce access |

This table is a proposal, not a decision — flagged explicitly so it isn't mistaken for one.

## Audit Logs

- Every price, discount, GST rate, or stock change should be logged with who changed it and when — this matters for a business handling GST-inclusive pricing and food-safety fields (FSSAI reference, batch numbers).
- No retention period or export format has been decided. **[OPEN DECISION]**

## Notifications

- Low-stock alerts (threshold from Products — see above)
- New order received
- New subscription sign-up
- Failed/unclear WhatsApp order (until Orders has real state, this may need to stay a manual process)

**[OPEN DECISION]** Delivery channel for these notifications (email, WhatsApp, in-admin only) is undecided.

## Future Modules

Explicitly out of scope for the current version of the admin, noted so they aren't forgotten (see `10-product-roadmap.md` for sequencing):

- Wholesale/marketplace pricing tiers (see `07-commerce-rules.md` → Future: Marketplace / Wholesale)
- Gift-box/packaging configuration (see `07-commerce-rules.md` → Packaging & Gift Boxes)
- Multi-language content management (depends on the `next-intl` decision in `06-progress.md`)

## Open Decisions

Consolidated from the modules above, for visibility:

1. Roles & Permissions: Current implementation uses string role attributes (`'admin'` vs `'user'`) for session protection. Detailed fine-grained role scopes remain a future policy decision.
2. Audit log retention/export policy.
3. Notification delivery channel (email, WhatsApp, in-admin only).
