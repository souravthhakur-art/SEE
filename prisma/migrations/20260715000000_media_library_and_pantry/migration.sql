-- Sprint 2.3 — Central Media Library
--
-- Adds `Media` (reusable asset records) and `ProductMedia` (product ↔
-- asset join, with a role and display order). Supersedes `ProductImage`,
-- which duplicated url/altText/caption per product instead of treating
-- an image as a shared, centrally-managed asset.
--
-- Data preservation: every existing `ProductImage` row is migrated
-- forward before the table is dropped, per the Phase 1 consolidation
-- requirement to preserve images across schema changes.
--   1. One `Media` row per distinct image URL (deduplicated — the same
--      photo used across multiple products becomes a single asset).
--   2. One `ProductMedia` row per original `ProductImage` row, linking
--      the owning product to the deduplicated `Media` row, preserving
--      `displayOrder` and mapping `isPrimary` -> role = 'featured'.

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('featured', 'gallery');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- CreateTable
CREATE TABLE "ProductMedia" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "role" "MediaRole" NOT NULL DEFAULT 'gallery',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductMedia_productId_mediaId_key" ON "ProductMedia"("productId", "mediaId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_idx" ON "ProductMedia"("productId");

-- CreateIndex
CREATE INDEX "ProductMedia_mediaId_idx" ON "ProductMedia"("mediaId");

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: backfill Media from distinct ProductImage.url values.
-- Ids are generated with md5(random()) rather than Prisma's cuid()
-- format — this is a one-time SQL backfill, not client-generated data,
-- and only needs to be unique, not cuid-shaped.
INSERT INTO "Media" ("id", "url", "altText", "caption", "createdAt", "updatedAt")
SELECT
  md5(random()::text || clock_timestamp()::text || pi."url") AS id,
  pi."url",
  (array_agg(pi."altText" ORDER BY pi."createdAt" ASC))[1] AS "altText",
  (array_agg(pi."caption" ORDER BY pi."createdAt" ASC))[1] AS "caption",
  MIN(pi."createdAt") AS "createdAt",
  CURRENT_TIMESTAMP AS "updatedAt"
FROM "ProductImage" pi
GROUP BY pi."url";

-- DataMigration: backfill ProductMedia by joining each ProductImage row
-- back to the Media row created for its url.
INSERT INTO "ProductMedia" ("id", "productId", "mediaId", "role", "displayOrder", "createdAt")
SELECT
  md5(random()::text || clock_timestamp()::text || pi."id") AS id,
  pi."productId",
  m."id" AS "mediaId",
  CASE WHEN pi."isPrimary" THEN 'featured'::"MediaRole" ELSE 'gallery'::"MediaRole" END AS "role",
  pi."displayOrder",
  pi."createdAt"
FROM "ProductImage" pi
JOIN "Media" m ON m."url" = pi."url";

-- DropTable
-- Superseded by Media + ProductMedia above; all rows have been migrated.
DROP TABLE "ProductImage";

-- Sprint 2.6 — Pantry (subscription) models
--
-- These tables were declared in schema.prisma back in Sprint 2.6 but no
-- migration ever created them (the gap that caused the "table does not
-- exist" runtime errors alongside the Media/ProductMedia regression).
-- Added here from scratch, matching prisma/schema.prisma lines ~458-556.

-- CreateTable
CREATE TABLE "Pantry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deliveryWindow" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "savingPercent" INTEGER NOT NULL DEFAULT 0,
    "shippingAddressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pantry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pantry_userId_idx" ON "Pantry"("userId");

-- CreateIndex
CREATE INDEX "Pantry_status_idx" ON "Pantry"("status");

-- AddForeignKey
ALTER TABLE "Pantry" ADD CONSTRAINT "Pantry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pantry" ADD CONSTRAINT "Pantry_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "pantryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_pantryId_productId_key" ON "PantryItem"("pantryId", "productId");

-- CreateIndex
CREATE INDEX "PantryItem_pantryId_idx" ON "PantryItem"("pantryId");

-- CreateIndex
CREATE INDEX "PantryItem_productId_idx" ON "PantryItem"("productId");

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_pantryId_fkey" FOREIGN KEY ("pantryId") REFERENCES "Pantry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PantrySchedule" (
    "id" TEXT NOT NULL,
    "pantryId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantrySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PantrySchedule_pantryId_idx" ON "PantrySchedule"("pantryId");

-- CreateIndex
CREATE INDEX "PantrySchedule_status_idx" ON "PantrySchedule"("status");

-- AddForeignKey
ALTER TABLE "PantrySchedule" ADD CONSTRAINT "PantrySchedule_pantryId_fkey" FOREIGN KEY ("pantryId") REFERENCES "Pantry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantrySchedule" ADD CONSTRAINT "PantrySchedule_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PantryPause" (
    "id" TEXT NOT NULL,
    "pantryId" TEXT NOT NULL,
    "pausedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryPause_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PantryPause_pantryId_idx" ON "PantryPause"("pantryId");

-- AddForeignKey
ALTER TABLE "PantryPause" ADD CONSTRAINT "PantryPause_pantryId_fkey" FOREIGN KEY ("pantryId") REFERENCES "Pantry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PantryDelivery" (
    "id" TEXT NOT NULL,
    "pantryId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "dispatchWindow" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PantryDelivery_orderId_key" ON "PantryDelivery"("orderId");

-- CreateIndex
CREATE INDEX "PantryDelivery_pantryId_idx" ON "PantryDelivery"("pantryId");

-- AddForeignKey
ALTER TABLE "PantryDelivery" ADD CONSTRAINT "PantryDelivery_pantryId_fkey" FOREIGN KEY ("pantryId") REFERENCES "Pantry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryDelivery" ADD CONSTRAINT "PantryDelivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PantryHistory" (
    "id" TEXT NOT NULL,
    "pantryId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PantryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PantryHistory_pantryId_idx" ON "PantryHistory"("pantryId");

-- AddForeignKey
ALTER TABLE "PantryHistory" ADD CONSTRAINT "PantryHistory_pantryId_fkey" FOREIGN KEY ("pantryId") REFERENCES "Pantry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
