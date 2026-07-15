# Commerce Rules

**Status:** Draft — first pass, needs your review and decisions before it can freeze
**Version:** 0.1
**Owner:** Palum Dhara Engineering / Business
**Depends on:** `CLAUDE.md`, `01-project-overview.md`, `04-architecture.md`

**Purpose** — The single source of truth for how Palum Dhara operates as a business: products, pricing, shipping, subscriptions, orders, returns, and inventory rules. This document is deliberately implementation-independent — it describes what *should* be true of the business, and `04-architecture.md` describes what the code *currently* does. Where they disagree, that's a real gap to close, not a documentation error.

**Update Rules** — Update when a business decision changes (pricing model, return window, shipping partner, tax handling). Do not add speculative policy — if a rule doesn't exist yet, mark it **Open Decision**, don't invent an answer.

**A note on method:** every rule below is tagged with where it came from:
- **[LIVE]** — already implemented in code and matches what customers see today
- **[COMMITTED]** — already promised in on-site copy (FAQ, product pages) but not yet enforced or automated in code
- **[OPEN DECISION]** — no answer exists yet anywhere; needs you to decide before an AI agent builds around it

Two direct contradictions surfaced while writing this — flagged inline in **Pricing** and **Subscriptions** below. Resolve those before this document freezes.

---

## 1. Products

**[LIVE]** Products are flat, hardcoded objects in `lib/data.ts` — no database, no CMS. 5 products currently exist across 4 categories: tea (2), honey (1), preserves (1), pickles (1). A `gifts` category is typed but has zero products in it today.

**[LIVE]** Every product carries a fixed content shape (see `04-architecture.md` → Data Models): short + long description, "why we selected it," a region story, ingredients, how-to-enjoy steps, storage instructions, a shipping note, and a `traceability` block (harvest season, estate, elevation, craft method, batch number). This is not optional boilerplate — it's the traceability promise the brand makes on every single product, and any new product must fill in all of it, not a subset.

**[LIVE]** Each product has admin-style flags already in its type — `featured`, `showInShop`, `subscriptionEligible`, `subscriptionPlans`, `displayOrder`, `status` (`active` / `draft` / `archived`) — but no admin UI exists to set them. Today, "publishing" or "discontinuing" a product means hand-editing `lib/data.ts` and redeploying.

**[OPEN DECISION]** What happens when a product is discontinued? The `status: "archived"` value exists in the type but nothing in the code branches on it yet (no component currently filters out archived products). Decide: does an archived product disappear from `/shop` entirely, stay visible as "no longer available," or redirect to a replacement? This should be answered before `09-admin-blueprint.md` designs a "discontinue product" button.

**[OPEN DECISION]** Can a product go out of stock mid-order? `inStock: boolean` exists per product, but there's no quantity/unit inventory count anywhere — it's a binary flag, hand-set. There's no reservation logic, so two customers could both "order" the last unit via WhatsApp with no system-level conflict prevention. Today this is fine because fulfillment is manual and human-confirmed over WhatsApp — but it's worth deciding now whether that stays true forever or whether real inventory counts are needed once order volume grows.

## 2. Categories & Collections

**[LIVE]** Four active categories today: Tea, Honey, Fruit Preserves, Traditional Pickles. `Gifts` is defined in the type but unused.

**[OPEN DECISION]** "Curated collections (seasonal/festive)" is listed as a product category in `01-project-overview.md`, but no `Collection` type or grouping mechanism exists anywhere in the data model. If seasonal collections (e.g. a Diwali gift set) are wanted, decide whether that's a new `Collection` type that references existing product `id`s, or simply a new `category` value. A collection that bundles several products for one price is a materially different shape than a single product, and doesn't fit today's flat catalogue.

## 3. Pricing

**[LIVE]** Prices are flat integers in INR (e.g. `499` = ₹499), no decimal/paise handling, no currency field (assumes India-only, single currency).

**[COMMITTED, CONTRADICTS CODE]** The FAQ answer for "Do you offer Cash on Delivery?" says: *"For prepaid orders, we offer an additional 5% discount."* **There is no prepaid payment method in this codebase at all** — checkout only produces a WhatsApp COD message (see `04-architecture.md` → Order/Checkout Flow). This FAQ answer is currently a promise the site cannot keep. **This needs a decision before launch**: either remove the prepaid-discount line from the FAQ until Razorpay (or similar) is actually integrated, or fast-track payment integration so the copy stays honest. Do not leave this live in its current contradictory state.

**[COMMITTED]** Free delivery above ₹1,000 — stated consistently in every product's `shippingNote` and in the FAQ. This is a real, live pricing rule even though it isn't calculated anywhere in the checkout UI (the WhatsApp order message doesn't currently add or waive a delivery fee — see Shipping below).

**[OPEN DECISION — GST]** No tax field, tax calculation, or GST-inclusive/exclusive labeling exists anywhere in the product data or checkout flow. As a food business selling online in India, this needs an explicit decision: are listed prices GST-inclusive? Is Palum Dhara currently registered for GST? Until this is answered, treat every price shown on the site as ambiguous for compliance purposes — this is a legal question, not just a display one, and belongs in front of a CA, not decided by an AI agent.

**[LIVE]** A powerful discount and coupon engine has been implemented in Sprint 2.5. It supports percentage and flat rate discount validations (e.g. `"WELCOME5"` welcome discount), minimum order value constraints, newcomer verification constraints, and usage limit counters.

## 4. Shipping

**[LIVE]** Shipping rules are dynamically calculated during Checkout: orders above ₹1,500 qualify for free delivery, while orders below that threshold incur a standard flat fee of ₹150.

**[COMMITTED]** From the FAQ: dispatched within 24–48 hours from Palampur, Himachal Pradesh; delivery in 3–7 business days depending on location; tracking sent via WhatsApp and email. Administrators track fulfillment dispatch states manually inside the Admin Orders module, which publishes notes and timeline status updates directly to the customer's account dashboard.

## 5. Subscriptions (My Pantry)

**[LIVE]** Four subscription tiers exist in `lib/data.ts`: Essential Pantry (₹599/mo), Family Pantry (₹899/mo), Seasonal Pantry (₹1,199/mo), Signature Pantry (₹1,499/mo).

**[LIVE]** In Sprint 2.6, the entire subscription lifecycle was implemented under the customer-facing **"My Pantry"** tab (`/account?tab=pantry`). It includes:
- **Subscription Setup Wizard:** Step-by-step customizer allowing subscribers to configure items, frequencies, and plans before commencing.
- **Configuration Panel:** Allows active subscribers to pause/resume states, skip the next scheduled delivery, or adjust item quantities.
- **Schedule Calendar:** Renders future delivery queues based on frequencies (`monthly`, `bi_monthly`, `tri_monthly`).
- **History Logs:** Tracks sequential delivery logs and timeline updates in the database (`PantryHistory`).

## 6. Orders

**[LIVE]** In Sprint 2.5, orders became fully database-backed transactions. Placing an order executes a secure `$transaction` server-side, saving record snapshots (`Order`, `OrderItem`) with an alphanumeric tracker (`PD-XXXX`), computing taxes and delivery fees, applying coupons, and tracking sequential status histories (`processing` ➔ `packed` ➔ `shipped` ➔ `delivered` ➔ `cancelled`). Customers track histories via a visual dashboard, and merchants manage fulfillment actions through `/admin/orders`.

## 7. Returns & Refunds

**[COMMITTED]** From the FAQ: 7-day no-questions-asked return window from delivery; opened/consumed food items are not eligible for physical return, but a full refund is issued anyway (i.e. for opened consumables, the customer keeps the product and still gets refunded — a deliberate trust-building policy, not standard retail practice). Unopened items are picked up and returned normally.

**[OPEN DECISION]** How is a refund actually issued when there's no payment gateway? Today, since checkout is COD, there is no captured payment to refund — "refund" for a COD order presumably means "don't collect payment for a rejected/returned item," which is a different mechanic than refunding a card or UPI payment. This needs to be spelled out once online payment exists, since the current FAQ language ("we will issue a full refund") implies a captured-payment refund flow that doesn't exist yet for COD orders.

## 8. Traceability

**[LIVE]** This is the most fully-implemented commerce rule in the entire codebase. Every product carries harvest season, estate name, elevation, craft/processing method, and a batch code (e.g. `KT260301`). This isn't decorative — it's the concrete expression of the brand's "Indian first," "authenticity before perfection" principles from `CLAUDE.md`, and should be treated as non-negotiable: **no product ships to `/shop` without a complete traceability block.** If a future product is added without one, that's a brand violation, not just a missing field.

## 9. Packaging & Gift Boxes

**[OPEN DECISION]** No packaging rules, gift-wrapping option, or gift-message field exists anywhere in the code or copy. "Gifting" is listed as a product category in `01-project-overview.md` and a `gifts` category exists in the `Product` type, but zero products use it and there's no gift-specific flow (no "this is a gift" checkbox, no gift note, no gift-box SKU). If gifting is a near-term priority, it needs its own small spec here before any UI is built.

## 10. Seasonal & Limited Products

**[LIVE]** The type system already supports this: `isLimited?: boolean` on `Product`, and Signature Pantry's contents explicitly include "1 x Limited Harvest Item (seasonal)." Traceability's `harvest` field (e.g. "Spring 2026") is inherently seasonal.

**[OPEN DECISION]** What happens when a seasonal/limited product's harvest sells out or the season ends — does it flip to `inStock: false`, move to `status: "archived"`, or get replaced by next season's batch under the same product `id`/slug (so existing links/reviews carry over) or a new one? This affects both the data model and the customer's mental model ("is this the same tea as last time?") and should be decided deliberately.

## 11. SHG (Self-Help Group) Products

**[COMMITTED]** Preserves and pickles are described in the FAQ and product copy as coming "from women-led SHGs across Himachal Pradesh," sourced directly rather than through intermediaries. This is a sourcing/ethics claim, not just flavor text — treat it with the same seriousness as the FSSAI health-claims rule in `CLAUDE.md`: **never state or imply SHG sourcing for a product where it isn't true.** If a future product's origin is uncertain or unverified, leave the claim out rather than defaulting to it because it fits the brand story.

## 12. Future: Marketplace / Wholesale

**[OPEN DECISION]** `01-project-overview.md` names marketplace presence and wholesale as post-launch business-model channels. Nothing in the current codebase, data model, or pricing structure anticipates multi-channel selling (no wholesale price tier, no marketplace-specific SKU mapping, no B2B minimum order quantities). This is explicitly out of scope for v1 and shouldn't influence current architecture decisions — noted here only so it isn't forgotten when `10-product-roadmap.md` sequences future phases.

---

## Summary: What Needs a Decision Before This Document Can Freeze

1. **GST treatment** — inclusive/exclusive, registration status. Needs a CA, not an AI agent.
2. **Refund mechanics for COD orders** — "full refund" language assumes a captured payment that doesn't exist yet under the current checkout model.

Everything else in this document is either already true in code, already promised in copy, or has been resolved in Sprints 2.5 and 2.6.
