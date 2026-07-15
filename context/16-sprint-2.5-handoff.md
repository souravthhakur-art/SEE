# Sprint 2.5 Handoff — Transactional Commerce Foundation

**Status:** COMPLETE (Fully verified & compiled green)
**Owner:** Lead Staff Engineer
**Depends on:** Sprint 2.4 Customer Accounts

---

## 1. Overview & Achievements
Sprint 2.5 transitions the Palum Dhara platform from a purely informational storefront to a fully integrated **Transactional Commerce Engine**. Every order placed by authenticated customers is recorded, tracked, and fulfilled through a database-backed, transactionally secure ledger, complete with promotional redemption logic and real-time state synchronization.

Key achievements of this sprint:
- **Prisma Database Integration:** Implemented structural, normalized PostgreSQL tables (`Order`, `OrderItem`, `OrderHistory`, `Coupon`, `PromotionRedemption`, `OrderNotes`) in Prisma.
- **Durable Checkout State:** Built a multi-step Checkout visual wizard (`/checkout`) validating user coordinates, managing saved addresses, computing Indian taxes (5% GST), and establishing Cash on Delivery (COD) order placement.
- **First-Order Reward Verification:** Created an automated First-Order coupon engine validating previous user ledger redemptions, ensuring a flat ₹500 discount is safely applied to brand newcomers via the `"WELCOME5"` promo.
- **Interactive Account History:** Developed a dynamic purchase ledger (`/account?tab=orders`) for consumers with vertical tracking timelines, custom notes, print-friendly receipts, and automatic basket rehydration.
- **Fulfillment Command Center:** Created an operational master-detail admin panel (`/admin/orders`) allowing merchants to search, filter by dispatch state, paginate orders, print packing slips, and log timeline-tracking entries.

---

## 2. Structural Schema & Data Model
Every transaction is snapshotted to guarantee immutable ledger records. Price, product metadata, and tax values are preserved at the point of sale.

*Refer to `/prisma/schema.prisma` for fields:*
- **`Order`**: Holds core metrics including order numbers (`PD-XXXX`), totals, tax, and optional customer-visible delivery instructions.
- **`OrderItem`**: Holds product details (name, weight, unit price) at purchase time. Even if catalog prices change, past orders remain unchanged.
- **`OrderHistory`**: Tracks sequential status changes (`processing` ➔ `packed` ➔ `shipped` ➔ `delivered` ➔ `cancelled`) with custom status notes.
- **`Coupon`**: Holds validation parameters (code, minimum value, usage limits, and newcomer flags).
- **`PromotionRedemption`**: Prevents double-redemption by matching user and order IDs against specific promotions.
- **`OrderNotes`**: Captures internal administrative logs for customer tracking.

---

## 3. Checkout Logic & Server Actions
All checkout operations run inside a strict server-side environment (`/app/checkout/actions.ts`), protecting business rules and API secret keys.

### Key Actions:
1. **`validateCoupon(code, currentSubtotal, userId)`**:
   - Performs database check on the coupon.
   - Verifies minimum order value criteria.
   - Validates if the coupon is restricted to first-time buyers by checking the `user.orders` count (must be zero for first-order coupons).
2. **`placeOrder(payload)`**:
   - Runs in a secure, atomized **Prisma database transaction (`$transaction`)**.
   - Verifies all cart item prices against catalog databases to prevent client-side tampering.
   - Calculates the dynamic delivery fee (e.g., Free over ₹1,500, else flat ₹150).
   - Computes tax-inclusive Indian standard rates (5% GST).
   - Validates and applies coupons (safely decrementing usage counts).
   - Stores the immutable `Order`, `OrderItem`s, and initial `OrderHistory` record.
   - Preserves state across platforms; clears the user's local basket (`clearCart`) on successful placement.

---

## 4. Customer Portal Experience
The `/account` page now includes a dedicated, highly interactive **Order History** dashboard:
- **Status Stepper Timeline:** Adapts dynamically to show where the package is in the fulfillment pipeline, alongside status notes provided by merchants.
- **Printable Invoices:** Features custom CSS hiding sidebars and headers, enabling customers to print clean, high-contrast, physical receipts.
- **Reorder Automation:** Integrates with the Zustand local cart store. Clicking "Reorder All" instantly maps historical items, quantities, and weights back into the active cart and navigates them to checkout for a rapid purchase experience.

---

## 5. Admin Dashboard Architecture
The merchant console (`/admin/orders`) is designed for efficient, daily shipping and packing workflows:
- **Master-Detail Bento Grid:** Displays a scrollable, searchable list of orders on the left and a detailed order viewer on the right.
- **Dynamic Search & Pagination:** Uses Next.js App Router query-parameter routing (`searchParams`) for instant filtering (by order number, name, or email) and database pagination.
- **Logistics Controller:** Enables administrators to transition status values and add tracking notes (e.g., tracking numbers or courier details), which are instantly visible on the customer's portal.
- **Packing Slip Printing:** Includes a dedicated printer layout for physical invoice insertion.

---

## 6. Directory Structure Overview
```bash
/app
  ├── admin/(dashboard)/orders/
  │     ├── page.tsx            # Server Component (query parsing & data loaders)
  │     └── actions.ts           # Admin status transition server action
  ├── checkout/
  │     ├── page.tsx            # Server-side checkout setup and address loader
  │     ├── actions.ts           # Core database-backed checkout transaction actions
  │     └── success/page.tsx    # Order success landing & WhatsApp coordinate receipt
/components
  ├── checkout/
  │     └── checkout-content.tsx # Multi-step checkout client application
  ├── admin/
  │     └── AdminOrdersContent.tsx # Split bento-grid master-detail fulfillment console
  └── account/
        └── AccountDashboard.tsx  # Dynamic user tracking page (reorder & order timeline)
```

---

## 7. Build Quality & Status
- **ESLint Validation:** Run and confirmed with 0 errors.
- **TypeScript Type Safety:** Fully typed parameter interfaces and strict typeguards.
- **Production Compilation:** Run and confirmed successful compilation under Turbopack (`next build` completes flawlessly).
