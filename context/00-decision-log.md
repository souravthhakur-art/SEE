# Decision Log

**Status:** Living (updates whenever a new architectural decision is made — same update cadence as `06-progress.md`)
**Version:** 0.1
**Owner:** Palum Dhara Engineering
**Depends on:** `CLAUDE.md`, `04-architecture.md`

**Purpose** — Single source of truth for architectural (as opposed to business) decisions: database engine, ORM, auth provider, ID strategy, and similar technical choices that `11-database-spec.md` and future engineering documents reference rather than re-decide. This is the technical counterpart to `07-commerce-rules.md`'s DECIDED/OPEN DECISION discipline, applied to infrastructure choices instead of business rules.

**Update Rules** — Add a new `DEC-XXX` entry when a real decision is made. Never mark something `Decided` because it's a reasonable default or a common industry choice — only when someone with the authority to decide has actually decided it. Update an entry's status in place rather than duplicating it if a decision changes later; note the change and the date.

**A note on this version:** every entry below reflects what's actually established somewhere in the existing documentation set (`CLAUDE.md`, `04-architecture.md`) or is explicitly unresolved. None of these are invented defaults — where the project hasn't decided something, it's marked `OPEN` rather than guessed.

---

| ID | Topic | Status | Decision |
|---|---|---|---|
| DEC-001 | ORM | **DECIDED** | Prisma is the project's ORM. Already integrated into the codebase (`prisma/schema.prisma`, `@prisma/client` installed); no proposal to replace it exists. |
| DEC-002 | Primary database engine (production) | **DECIDED** | PostgreSQL hosted on Neon. Selected during Sprint 1 as the production database: Neon project created, Prisma provider switched to PostgreSQL, `.env` updated, connection verified with Prisma. |
| DEC-003 | Authentication provider | **DECIDED** | Better Auth. Selected during Sprint 1 after evaluating Better Auth and Auth.js. Chosen for its modern Next.js App Router integration, Prisma support, strong TypeScript experience, and suitability for the planned customer and admin account architecture. |
| DEC-004 | Primary key / ID strategy (UUID vs. auto-increment vs. CUID) | **DECIDED** | Use `cuid()` for all primary keys unless a specific model requires a different strategy. Native Prisma support, URL-safe identifiers, no database extensions required, consistent across the application. |
| DEC-005 | Soft delete strategy | **OPEN** | Not addressed anywhere. `07-commerce-rules.md`'s `status: archived` field on `Product` is a publishing state, not a defined soft-delete mechanism — see `07-commerce-rules.md` §1, still an open question what "archived" actually does. |
| DEC-006 | Audit field convention (`createdAt`/`updatedAt`/`createdBy`/`updatedBy`) | **OPEN** | `09-admin-blueprint.md` → Audit Logs establishes that changes to price/discount/GST/stock should be logged with who and when, but doesn't specify the field-level mechanism. No retention period or export format decided either (same section, flagged as its own open item). |
| DEC-007 | `Order` data model | **DECIDED** (2026-07-14) | Decided via Sprint 2.5 Transactional Commerce: complete relational order management with `Order`, `OrderItem`, `OrderHistory`, `Coupon`, `PromotionRedemption`, `OrderNotes` schema models fully migrated and integrated. Orders have alphanumeric identifiers like `PD-XXXX`. |
| DEC-008 | `Collection` data model | **DECIDED** (2026-07-13) | Decided via the Sprint 2.2 spec ("Categories & Collections"): a Collection is a distinct type — a curated merchandising group with its own `name`/`slug`/`description`/`featured`/`active`/`displayOrder`/`image` — that references `Product` ids through a `CollectionProduct` join table, not a new `category` value and not a field on `Product`. Implemented in `prisma/schema.prisma` (`Collection`, `CollectionProduct`) and `prisma/migrations/20260713120000_categories_collections`. Previously **OPEN**, carried from `07-commerce-rules.md` §2. |
| DEC-009 | Roles & Permissions structure | **DECIDED** (2026-07-14) | Decided via Sprint 2.4 Customer Accounts implementation: a simple string role attribute exists on the `User` table, defaulting to `'user'` for normal customers and supporting `'admin'` for site administrators. This provides clean route and API protection. |
| DEC-010 | Inventory reservation / locking logic | **OPEN** | Carried from `07-commerce-rules.md` §1 — the numeric `Stock` field itself is decided, but what happens when two customers claim the same last unit is not. |
| DEC-011 | Subscription lifecycle (renewal, failed/skipped month, item-swap fulfillment) | **DECIDED** (2026-07-15) | Decided via Sprint 2.6 "My Pantry" implementation: unified under a multi-level relational design (`Pantry`, `PantryItem`, `PantrySchedule`, `PantryPause`, `PantryDelivery`, `PantryHistory`) allowing automated scheduled delivery queues, custom skip actions, customer-facing setup wizards, pause/resume state tracks, and complete transactional item modifications. |
| DEC-012 | "The Himalayan Pantry" vs. current subscription tiers | **DECIDED** (2026-07-15) | Decided in Sprint 2.6: Unified "The Himalayan Pantry" membership directly with the four subscription tiers under the customer-facing "My Pantry" product interface. Tiers (Everyday, Home, Seasonal, Signature Harvest) are structured as configurable, itemized subscriptions with tier-specific savings percentages. |
| DEC-013 | Saved Address Management schema | **DECIDED** (2026-07-14) | Relational `Address` model in Prisma containing a user reference (`userId`), label (`Home`/`Work`), address lines, and default flags (`isDefaultShipping`, `isDefaultBilling`). Cascade deletion ensures cleanliness when a User profile is deleted. |
| DEC-014 | Centralized Media Library & Reusable Assets | **DECIDED** (2026-07-15) | Restored the centralized Media Library from an earlier Sprint 2.3 regression. Media assets are modeled as independent, first-class records (`Media` and `ProductMedia` join table) so that any product can reuse the same image url/altText/caption, preventing duplicate asset declarations. |
| DEC-015 | Internal Admin CMS Architecture | **DECIDED** (2026-07-15) | Implemented a native admin dashboard CMS (`/app/admin`) structured within Next.js App Router route groups, protecting editing capabilities via `requireAdminSession` server-side validation. Includes modules for product curation, categories reordering, collections management, orders ledger tracking, and media asset library management. |

---

**How to add a decision:** append a new row with the next `DEC-XXX` number, a clear one-line topic, a status, and the decision itself (or `OPEN` with a one-line reason it's unresolved). Reference the `DEC-XXX` ID from any document that depends on it, rather than restating the decision inline — this file is the only place a technical decision should be stated in full.

**Implementation Rule** — Engineering implementations must follow only `DECIDED` entries. `OPEN` entries must never be implemented without first updating this document.
