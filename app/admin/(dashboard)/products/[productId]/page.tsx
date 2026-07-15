import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import { ProductDeleteButton } from "@/components/admin/products/ProductDeleteButton"
import { ProductStatusBadge } from "@/components/admin/products/ProductStatusBadge"
import { deleteProductAction } from "@/app/admin/(dashboard)/products/actions"
import { formatAdminCurrency, getDerivedStockStatus } from "@/lib/admin/product-form"
import { getProductById } from "@/lib/admin/products"

function SuccessNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-forest/25 bg-forest/10 px-4 py-3 text-sm text-forest">{message}</div>
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-wood-light/30 bg-ivory p-6">
      <p className="label text-wood">{title}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-wood-light/15 pb-4 last:border-b-0 last:pb-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4">
      <dt className="text-sm font-medium text-charcoal">{label}</dt>
      <dd className="text-sm leading-6 text-wood">{value}</dd>
    </div>
  )
}

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { productId } = await params
  const resolvedSearchParams = await searchParams
  const product = await getProductById(productId)

  if (!product) {
    notFound()
  }

  const success = Array.isArray(resolvedSearchParams.success)
    ? resolvedSearchParams.success[0]
    : resolvedSearchParams.success
  const stockStatus = getDerivedStockStatus(product.stock)
  const deleteAction = deleteProductAction.bind(null, product.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Product detail</p>
          <h1 className="heading-lg text-charcoal">{product.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">{product.shortDescription}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ProductStatusBadge status={product.status} />
            {product.featured ? (
              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                Featured
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full border border-wood-light/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-wood">
              {stockStatus === "in_stock" ? "In stock" : "Out of stock"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/products/${product.id}/edit`} className="btn-primary px-6 py-3 text-xs">
            <Pencil size={16} aria-hidden="true" />
            Edit product
          </Link>
          <ProductDeleteButton productName={product.name} action={deleteAction} cancelHref={`/admin/products/${product.id}`} />
        </div>
      </div>

      <SuccessNotice message={success} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="space-y-6">
          <DetailCard title="Overview">
            <dl className="space-y-4">
              <DetailRow label="Slug" value={product.slug} />
              <DetailRow label="SKU" value={product.sku} />
              <DetailRow label="Category" value={product.category.name} />
              <DetailRow label="Description" value={product.description} />
              <DetailRow label="Why we selected it" value={product.whyWeSelected} />
              <DetailRow label="Region story" value={product.regionStory} />
            </dl>
          </DetailCard>

          <DetailCard title="Producer and source">
            <dl className="space-y-4">
              <DetailRow label="Producer" value={product.source?.producerName ?? "—"} />
              <DetailRow label="Producer type" value={product.source?.producerType ?? "—"} />
              <DetailRow label="Village" value={product.source?.village ?? "—"} />
              <DetailRow label="District" value={product.source?.district ?? "—"} />
              <DetailRow label="State" value={product.source?.state ?? "—"} />
              <DetailRow label="Craft method" value={product.source?.craftMethod ?? "—"} />
            </dl>
          </DetailCard>

          <DetailCard title="Images and related products">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-medium text-charcoal">Images</h2>
                {product.images.length === 0 ? (
                  <p className="mt-2 text-sm text-wood">No images attached yet.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {product.images.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-sm border border-wood-light/20 bg-white">
                        <div className="aspect-[4/3] bg-ivory-dark">
                          <img src={image.url} alt={image.altText} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 p-4 text-sm text-wood">
                          <p className="font-medium text-charcoal">{image.altText}</p>
                          <p>{image.caption ?? "No caption"}</p>
                          <p className="text-xs uppercase tracking-[0.14em] text-wood-light">
                            {image.isPrimary ? "Primary image" : `Display order ${image.displayOrder}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-charcoal">Related products</h2>
                {product.relatedProducts.length === 0 ? (
                  <p className="mt-2 text-sm text-wood">No related products configured.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {product.relatedProducts.map((relation) => (
                      <li key={relation.id} className="rounded-sm border border-wood-light/20 bg-white px-4 py-3 text-sm text-charcoal">
                        <Link href={`/admin/products/${relation.relatedProduct.id}`} className="font-medium text-charcoal transition hover:text-forest">
                          {relation.relatedProduct.name}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-wood">
                          {relation.relatedProduct.sku} · {relation.relatedProduct.status} · {relation.relatedProduct.slug}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-charcoal">Collections</h2>
                {product.collections.length === 0 ? (
                  <p className="mt-2 text-sm text-wood">Not assigned to any collection.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {product.collections.map((entry) => (
                      <li key={entry.id} className="rounded-sm border border-wood-light/20 bg-white px-4 py-3 text-sm text-charcoal">
                        <Link href={`/admin/categories/collections/${entry.collection.id}`} className="font-medium text-charcoal transition hover:text-forest">
                          {entry.collection.name}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-wood">{entry.collection.slug}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Pricing and publishing">
            <dl className="space-y-4">
              <DetailRow label="Selling price" value={formatAdminCurrency(product.sellingPrice)} />
              <DetailRow label="MRP" value={formatAdminCurrency(product.mrp)} />
              <DetailRow label="Cost price" value={product.costPrice === null ? "—" : formatAdminCurrency(product.costPrice)} />
              <DetailRow label="GST" value={`${product.gstRate}%`} />
              <DetailRow label="Weight / unit" value={product.weight} />
              <DetailRow label="Display order" value={product.displayOrder} />
              <DetailRow label="Stock status" value={stockStatus === "in_stock" ? "In stock" : "Out of stock"} />
            </dl>
          </DetailCard>

          <DetailCard title="Operational notes">
            <dl className="space-y-4">
              <DetailRow label="Storage" value={product.storage} />
              <DetailRow label="Shipping note" value={product.shippingNote} />
              <DetailRow label="Created" value={product.createdAt.toLocaleString("en-IN")} />
              <DetailRow label="Last updated" value={product.updatedAt.toLocaleString("en-IN")} />
            </dl>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
