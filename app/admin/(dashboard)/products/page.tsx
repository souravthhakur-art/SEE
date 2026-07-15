import Link from "next/link"
import { Plus, Package } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"
import { ProductFilters } from "@/components/admin/products/ProductFilters"
import { ProductStatusBadge } from "@/components/admin/products/ProductStatusBadge"
import { formatAdminCurrency, getDerivedStockStatus } from "@/lib/admin/product-form"
import { buildProductListQueryString, getProductFormOptions, getProductList, parseProductListParams } from "@/lib/admin/products"

function SuccessNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-forest/25 bg-forest/10 px-4 py-3 text-sm text-forest">{message}</div>
}

function Pagination({
  currentPage,
  totalPages,
  baseParams,
}: {
  currentPage: number
  totalPages: number
  baseParams: {
    query: string
    status: string
    category: string
    featured: string
    sort: string
  }
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-wood-light/20 pt-5">
      <p className="text-sm text-wood">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={`/admin/products${buildProductListQueryString({ ...baseParams, page: Math.max(1, currentPage - 1) })}`}
          aria-disabled={currentPage === 1}
          className={`inline-flex items-center justify-center rounded-sm border px-3 py-2 text-sm font-medium ${
            currentPage === 1
              ? "pointer-events-none border-wood-light/20 text-wood-light/70"
              : "border-wood-light/50 text-charcoal transition hover:bg-ivory-dark"
          }`}
        >
          Previous
        </Link>

        <Link
          href={`/admin/products${buildProductListQueryString({ ...baseParams, page: Math.min(totalPages, currentPage + 1) })}`}
          aria-disabled={currentPage === totalPages}
          className={`inline-flex items-center justify-center rounded-sm border px-3 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "pointer-events-none border-wood-light/20 text-wood-light/70"
              : "border-wood-light/50 text-charcoal transition hover:bg-ivory-dark"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  )
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const filters = parseProductListParams(resolvedSearchParams)
  const [listResult, { categories }] = await Promise.all([getProductList(filters), getProductFormOptions()])
  const success = Array.isArray(resolvedSearchParams.success)
    ? resolvedSearchParams.success[0]
    : resolvedSearchParams.success

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Sprint 2.1</p>
          <h1 className="heading-lg text-charcoal">Products</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">
            Database-backed product management for the admin dashboard. This module keeps the storefront on static data while giving the team a production-ready internal CMS for the Prisma Product model.
          </p>
        </div>

        <Link href="/admin/products/new" className="btn-primary px-6 py-3 text-xs">
          <Plus size={16} aria-hidden="true" />
          Create product
        </Link>
      </div>

      <SuccessNotice message={success} />

      <ProductFilters filters={filters} categories={categories} />

      <section className="rounded-sm border border-wood-light/30 bg-ivory">
        <div className="flex items-center justify-between border-b border-wood-light/20 px-5 py-4">
          <div>
            <p className="label text-wood">Catalog</p>
            <p className="mt-1 text-sm text-charcoal">
              {listResult.totalCount} product{listResult.totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {listResult.products.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Package}
              title={listResult.totalCount === 0 ? "No products yet" : "No products match these filters"}
              description={
                listResult.totalCount === 0
                  ? "Create the first database-backed product without touching the storefront wiring."
                  : "Adjust search, status, category, featured state, or sorting to widen the result set."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-wood-light/20">
                <thead>
                  <tr className="bg-ivory-dark/70 text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Product</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Category</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Price</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Status</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Updated</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-light/15">
                  {listResult.products.map((product) => {
                    const stockStatus = getDerivedStockStatus(product.stock)
                    const leadImage = product.images[0]

                    return (
                      <tr key={product.id} className="align-top">
                        <td className="px-5 py-4">
                          <div className="flex min-w-[280px] gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-wood-light/20 bg-ivory-dark">
                              {leadImage ? (
                                <img src={leadImage.url} alt={leadImage.altText} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[11px] uppercase tracking-[0.16em] text-wood">No image</span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/admin/products/${product.id}`} className="font-medium text-charcoal transition hover:text-forest">
                                  {product.name}
                                </Link>
                                {product.featured ? (
                                  <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                                    Featured
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-sm text-wood">{product.shortDescription}</p>
                              <p className="text-xs uppercase tracking-[0.14em] text-wood-light">
                                {product.sku} · {product.slug}
                              </p>
                              {product.source ? (
                                <p className="text-xs text-wood">
                                  {product.source.producerName} · {product.source.district}, {product.source.state}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-charcoal">{product.category.name}</td>
                        <td className="px-5 py-4 text-sm text-charcoal">
                          <div>{formatAdminCurrency(product.sellingPrice)}</div>
                          <div className="text-xs text-wood">MRP {formatAdminCurrency(product.mrp)}</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-charcoal">
                          <div className="space-y-2">
                            <ProductStatusBadge status={product.status} />
                            <p className="text-xs uppercase tracking-[0.14em] text-wood">
                              {stockStatus === "in_stock" ? "In stock" : "Out of stock"}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-wood">
                          <div>{product.updatedAt.toLocaleDateString("en-IN")}</div>
                          <div className="text-xs text-wood-light">Display #{product.displayOrder}</div>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <div className="flex min-w-[180px] flex-col gap-2">
                            <Link href={`/admin/products/${product.id}`} className="font-medium text-forest transition hover:text-forest-light">
                              View details
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`} className="font-medium text-charcoal transition hover:text-forest">
                              Edit product
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-5">
              <Pagination
                currentPage={filters.page}
                totalPages={listResult.totalPages}
                baseParams={{
                  query: filters.query,
                  status: filters.status,
                  category: filters.category,
                  featured: filters.featured,
                  sort: filters.sort,
                }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
