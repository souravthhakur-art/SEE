import Link from "next/link"
import { ProductForm } from "@/components/admin/products/ProductForm"
import { createProductAction } from "@/app/admin/(dashboard)/products/actions"
import { getProductFormOptions } from "@/lib/admin/products"

export default async function AdminNewProductPage() {
  const { categories, relatedProducts, collections, mediaOptions } = await getProductFormOptions()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">New product</p>
        <h1 className="heading-lg text-charcoal">Create product</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Add a new database-backed product without touching the storefront wiring. The form writes to the existing Prisma schema and preserves the current admin architecture.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-sm border border-wood-light/30 bg-ivory p-6">
          <p className="font-medium text-charcoal">At least one category is required before creating a product.</p>
          <p className="mt-2 text-sm text-wood">
            Categories already exist in the schema, but this sprint does not build category management. Seed or create categories before adding more products.
          </p>
          <Link href="/admin/products" className="mt-4 inline-flex text-sm font-medium text-forest transition hover:text-forest-light">
            Back to product list
          </Link>
        </div>
      ) : (
        <ProductForm
          mode="create"
          action={createProductAction}
          categories={categories}
          relatedProducts={relatedProducts}
          collections={collections}
          mediaOptions={mediaOptions}
          cancelHref="/admin/products"
        />
      )}
    </div>
  )
}
