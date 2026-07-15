# Database Specification

**Status:** Active (Implemented in Sprints 1, 2.4, 2.5, and 2.6)
**Version:** 1.1.0
**Owner:** Palum Dhara Engineering
**Depends on:** `CLAUDE.md`, `07-commerce-rules.md`, `09-admin-blueprint.md`

## Implementation Status

The PostgreSQL production database hosted on Neon and mapped via Prisma ORM is fully operational and synchronized with the codebase:
- **Better Auth Identity Models:** `User`, `Account`, `Session`, `Verification` are actively wired.
- **Product Curation CMS:** `Product`, `Category`, `Collection`, `CollectionProduct`, `Media`, `ProductMedia`, `ProductSource`, `RelatedProduct` tables support administrative curation without code redeploys.
- **Transactional Commerce:** `Order`, `OrderItem`, `OrderHistory`, `Coupon`, `Promotion`, `PromotionRedemption`, `Discount`, `OrderNotes` support dynamic checkouts, first-order promotions, and tracking.
- **My Pantry Subsystem:** `Pantry`, `PantryItem`, `PantrySchedule`, `PantryPause`, `PantryDelivery`, `PantryHistory` tables handle the customer subscription lifecycle.
- **Customer Preferences & Addresses:** `Address` and `NewsletterSubscriber` are fully persistent.

---

## Design Principles

- **PostgreSQL Database:** Handled via Neon Serverless Cloud.
- **Prisma ORM:** Single source of truth for schema definitions and type-safe database queries.
- **UUID & CUID Keys:** Standard primary keys (CUID/UUID patterns) for safe distributed records.
- **Money Fields:** All commerce prices (selling price, MRP, cost price, subtotals, grand totals, shipping, discount, tax) are stored as integers in **paise** (equivalent to cents, 1 INR = 100 paise) to prevent floating-point calculation errors.
- **Relations Integrity:** Cascading deletes used where appropriate (e.g., delete user cascades address deletion, delete product cascades media join references).

---

## Core Models & Schema Mappings

### 1. Identity & Auth (Better Auth compatible)

#### `User`
Tracks authenticated customer and merchant identities.
- `id`: String (CUID, Primary Key)
- `fullName`: String
- `email`: String (Unique)
- `phone`: String (Unique, Optional)
- `role`: String (Defaults to "user", "admin" denotes merchant CMS access)
- `banned`: Boolean (Defaults to false)
- `banReason`: String (Optional)
- `banExpires`: DateTime (Optional)
- `marketingConsent`: Boolean (Defaults to false)
- `createdAt` / `updatedAt`: DateTime

#### `Session`
Represents an active Better Auth user login session.
- `id`: String (Primary Key)
- `userId`: String (Foreign Key ➔ User)
- `token`: String (Unique)
- `expiresAt`: DateTime
- `ipAddress`: String (Optional)
- `userAgent`: String (Optional)

#### `Account`
Better Auth login credentials and provider links.
- `id`: String (Primary Key)
- `userId`: String (Foreign Key ➔ User)
- `providerId` / `accountId`: String
- `password`: String (Hashed, Optional)

#### `Verification`
Handles login and email verification codes.
- `id`: String (Primary Key)
- `identifier`: String
- `value`: String
- `expiresAt`: DateTime

---

### 2. Product Catalog Curation

#### `Product`
The master storefront item model.
- `id`: String (CUID, Primary Key)
- `sku`: String (Unique)
- `slug`: String (Unique)
- `name`: String
- `shortDescription` / `description`: String
- `categoryId`: String (Foreign Key ➔ Category)
- `sellingPrice` / `mrp` / `costPrice`: Int (in paise)
- `gstRate`: Decimal (e.g. 5.00 for GST calculation)
- `taxInclusive`: Boolean (Defaults to true)
- `stock` / `lowStockThreshold`: Int
- `weight`: String
- `shelfLife`: String (Optional)
- `batchNumber`: String (Optional)
- `fssaiLicenseRef`: String (Optional)
- `fulfilledBy`: Enum (`palum_dhara`, `shg`, `farmer_collective`, `partner_producer`)
- `status`: Enum (`draft`, `active`, `archived`)
- `isLimited`: Boolean (Defaults to false)
- `featured` / `showInShop` / `subscriptionEligible`: Boolean
- `subscriptionPlans`: String[] (Supported subscription schedules)
- `displayOrder`: Int

#### `Category`
Product groupings with parent/child hierarchical relations.
- `id`: String (CUID, Primary Key)
- `slug`: String (Unique)
- `name`: String
- `parentId`: String (Foreign Key ➔ Self, Optional)
- `displayOrder`: Int

#### `Collection` & `CollectionProduct`
Enables curated groupings (e.g., "Monsoon Harvest") utilizing a many-to-many join table.
- `collectionId`: String (Foreign Key ➔ Collection)
- `productId`: String (Foreign Key ➔ Product)
- `displayOrder`: Int

#### `ProductSource`
Sourcing and provenance mapping (Source & Origin fields).
- `productId`: String (Unique Foreign Key ➔ Product)
- `village` / `district` / `state`: String
- `producerName`: String
- `producerType`: Enum (`shg`, `farm`, `cooperative`, `estate`)
- `craftMethod`: String (Optional)
- `latitude` / `longitude`: Float (Optional)

---

### 3. Transactional Commerce (Sprint 2.5)

#### `Order`
Immortal purchase transaction ledger.
- `id`: String (CUID, Primary Key)
- `orderNumber`: String (Unique tracking code, e.g. `PD-XXXX`)
- `userId`: String (Foreign Key ➔ User, Nullable for guest checkouts)
- `status`: Enum (`processing`, `packed`, `shipped`, `delivered`, `cancelled`)
- `subtotal` / `shippingFee` / `discount` / `tax` / `grandTotal`: Int (in paise)
- `shippingAddress` / `billingAddress`: Json (Frozen address snapshots at checkout)
- `couponCode`: String (Optional)

#### `OrderItem`
Itemized lines in a placed purchase order.
- `id`: String (CUID, Primary Key)
- `orderId`: String (Foreign Key ➔ Order)
- `productId`: String (Foreign Key ➔ Product, Nullable to preserve item reference if product is deleted)
- `productName` / `productSku` / `productSlug`: String
- `price`: Int (Snapshotted purchase price in paise)
- `quantity`: Int
- `weight`: String

#### `OrderHistory`
Logs automated and manual administrative status changes.
- `id`: String (CUID, Primary Key)
- `orderId`: String (Foreign Key ➔ Order)
- `status`: Enum (`OrderStatus`)
- `notes`: String (Fulfillment tracking details)
- `changedBy`: String (Optional)

#### `Coupon` & `Promotion` & `PromotionRedemption`
Automates discounts, coupon code entries, validation constraints, and limits.
- `code`: String (Unique)
- `discountType`: String ("percentage" or "fixed")
- `discountValue`: Int (percentage or flat amount in paise)
- `minOrderValue`: Int (in paise)
- `firstOrderOnly` / `onePerCustomer`: Boolean

---

### 4. Subscription "My Pantry" Subsystem (Sprint 2.6)

#### `Pantry`
Represents an active or paused customer subscription box.
- `id`: String (CUID, Primary Key)
- `userId`: String (Foreign Key ➔ User)
- `name`: String (e.g., "Everyday Harvest")
- `status`: String (Defaults to "active", supports "paused", "cancelled")
- `deliveryWindow`: String ("early_month" or "late_month")
- `frequency`: String ("monthly", "bi_monthly", "tri_monthly")
- `tier`: String (e.g. "three_month" or "six_month")
- `savingPercent`: Int (Calculated package discount rate)
- `shippingAddressId`: String (Foreign Key ➔ Address)

#### `PantryItem`
Configure subscription quantities of products per pantry box.
- `pantryId`: String (Foreign Key ➔ Pantry)
- `productId`: String (Foreign Key ➔ Product)
- `quantity`: Int (Defaults to 1)

#### `PantrySchedule`
Scheduled future deliveries queue.
- `pantryId`: String (Foreign Key ➔ Pantry)
- `scheduledDate`: DateTime (Target delivery month-year)
- `status`: String (Defaults to "pending", "skipped", "completed")
- `orderId`: String (Nullable Foreign Key ➔ Order)

#### `PantryPause`
Logs subscription pausing timeline blocks.
- `pantryId`: String (Foreign Key ➔ Pantry)
- `pausedAt`: DateTime
- `resumedAt`: DateTime (Nullable)
- `reason`: String (Optional)

#### `PantryDelivery`
Fulfillment tracks for dispatched pantry boxes.
- `pantryId`: String (Foreign Key ➔ Pantry)
- `orderId`: String (Unique Foreign Key ➔ Order)
- `status`: String ("processing", "shipped", "delivered")

#### `PantryHistory`
Logs changes to pantry configurations.
- `pantryId`: String (Foreign Key ➔ Pantry)
- `action`: String (e.g., "paused", "skipped", "item_quantity_changed")
- `notes`: String (Optional)
- `changedBy`: String ("customer" or "admin")

---

### 5. Media Assets Library

#### `Media` & `ProductMedia`
A centralized reusable asset repository supporting many-to-many associations with products (resolving Sprint 2.3 catalog regression).
- `url`: String (Unique, e.g. CDN or absolute storage paths)
- `altText`: String
- `caption`: String (Optional)
- `role`: Enum (`featured`, `gallery` on join record)
- `displayOrder`: Int

---

### 6. Customer Preferences

#### `Address`
Saves verified customer address cards.
- `userId`: String (Foreign Key ➔ User)
- `label`: String (e.g. "Home", "Office")
- `addressLine1` / `addressLine2` / `city` / `state` / `postalCode`: String
- `isDefaultShipping` / `isDefaultBilling`: Boolean

#### `NewsletterSubscriber`
Captures email subscribers.
- `email`: String (Unique)
- `isActive`: Boolean (Defaults to true)
