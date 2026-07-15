import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/products/ProductForm"
import { updateProductAction } from "@/app/admin/(dashboard)/products/actions"
import { getProductById, getProductFormOptions, mapProductToFormValues } from "@/lib/admin/products"

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const [product, { categories, relatedProducts, collections, mediaOptions }] = await Promise.all([
    getProductById(productId),
    getProductFormOptions(productId),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">Edit product</p>
        <h1 className="heading-lg text-charcoal">{product.name}</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Update every field required for Sprint 2.1 while preserving the current admin dashboard architecture and Prisma schema.
        </p>
      </div>

      <ProductForm
        mode="edit"
        action={updateProductAction.bind(null, product.id)}
        categories={categories}
        relatedProducts={relatedProducts}
        collections={collections}
        mediaOptions={mediaOptions}
        initialValues={mapProductToFormValues(product)}
        cancelHref={`/admin/products/${product.id}`}
      />
    </div>
  )
}
