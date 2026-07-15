-- Sprint 2.2 — Categories & Collections
-- Additive, backward-compatible migration:
--   * Category gains a self-referencing parent, featured/active flags,
--     an image, and SEO fields. All new columns are nullable or have
--     defaults, so every existing Category row remains valid.
--   * Collection and CollectionProduct are new tables (resolves DEC-008:
--     a Collection is a distinct type that references Product ids via a
--     join table, not a new Category/Product value).

-- AlterTable
ALTER TABLE "Category"
    ADD COLUMN "parentId" TEXT,
    ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "image" TEXT,
    ADD COLUMN "seoTitle" TEXT,
    ADD COLUMN "seoDescription" TEXT;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionProduct" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_featured_idx" ON "Collection"("featured");

-- CreateIndex
CREATE INDEX "Collection_active_idx" ON "Collection"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionProduct_collectionId_productId_key" ON "CollectionProduct"("collectionId", "productId");

-- CreateIndex
CREATE INDEX "CollectionProduct_collectionId_idx" ON "CollectionProduct"("collectionId");

-- CreateIndex
CREATE INDEX "CollectionProduct_productId_idx" ON "CollectionProduct"("productId");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_featured_idx" ON "Category"("featured");

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionProduct" ADD CONSTRAINT "CollectionProduct_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionProduct" ADD CONSTRAINT "CollectionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
