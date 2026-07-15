import Link from "next/link"
import { Plus, Tag } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"
import { CategoryCollectionTabs } from "@/components/admin/categories/CategoryCollectionTabs"
import { CategoryFilters } from "@/components/admin/categories/CategoryFilters"
import { CategoryStatusBadge } from "@/components/admin/categories/CategoryStatusBadge"
import { buildCategoryListQueryString, getCategoryFormOptions, getCategoryList, parseCategoryListParams } from "@/lib/admin/categories"

function SuccessNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-forest/25 bg-forest/10 px-4 py-3 text-sm text-forest">{message}</div>
}

function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-red-700/25 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
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
    featured: string
    active: string
    parent: string
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
          href={`/admin/categories${buildCategoryListQueryString({ ...baseParams, page: Math.max(1, currentPage - 1) })}`}
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
          href={`/admin/categories${buildCategoryListQueryString({ ...baseParams, page: Math.min(totalPages, currentPage + 1) })}`}
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

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const filters = parseCategoryListParams(resolvedSearchParams)
  const [listResult, { parentOptions }] = await Promise.all([getCategoryList(filters), getCategoryFormOptions()])
  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Sprint 2.2</p>
          <h1 className="heading-lg text-charcoal">Categories & Collections</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">
            Manage the Prisma Category tree used by the product catalog: parent/child structure, featured and active
            state, SEO metadata, and product counts.
          </p>
        </div>

        <Link href="/admin/categories/new" className="btn-primary px-6 py-3 text-xs">
          <Plus size={16} aria-hidden="true" />
          Create category
        </Link>
      </div>

      <CategoryCollectionTabs active="categories" />

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <CategoryFilters filters={filters} parentOptions={parentOptions} />

      <section className="rounded-sm border border-wood-light/30 bg-ivory">
        <div className="flex items-center justify-between border-b border-wood-light/20 px-5 py-4">
          <div>
            <p className="label text-wood">Categories</p>
            <p className="mt-1 text-sm text-charcoal">
              {listResult.totalCount} categor{listResult.totalCount === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>

        {listResult.categories.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Tag}
              title={listResult.totalCount === 0 ? "No categories yet" : "No categories match these filters"}
              description={
                listResult.totalCount === 0
                  ? "Create the first category to start organizing the product catalog."
                  : "Adjust search, featured, status, parent, or sorting to widen the result set."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-wood-light/20">
                <thead>
                  <tr className="bg-ivory-dark/70 text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Category</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Parent</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Products</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Status</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Updated</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-light/15">
                  {listResult.categories.map((category) => (
                    <tr key={category.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="min-w-[240px] space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/categories/${category.id}`} className="font-medium text-charcoal transition hover:text-forest">
                              {category.name}
                            </Link>
                            {category.featured ? (
                              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          {category.description ? <p className="text-sm text-wood">{category.description}</p> : null}
                          <p className="text-xs uppercase tracking-[0.14em] text-wood-light">{category.slug}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-charcoal">{category.parent?.name ?? "—"}</td>
                      <td className="px-5 py-4 text-sm text-charcoal">
                        <div>{category._count.products} product{category._count.products === 1 ? "" : "s"}</div>
                        <div className="text-xs text-wood">
                          {category._count.children} child categor{category._count.children === 1 ? "y" : "ies"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-charcoal">
                        <CategoryStatusBadge active={category.active} />
                      </td>
                      <td className="px-5 py-4 text-sm text-wood">
                        <div>{category.updatedAt.toLocaleDateString("en-IN")}</div>
                        <div className="text-xs text-wood-light">Display #{category.displayOrder}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex min-w-[180px] flex-col gap-2">
                          <Link href={`/admin/categories/${category.id}`} className="font-medium text-forest transition hover:text-forest-light">
                            View details
                          </Link>
                          <Link href={`/admin/categories/${category.id}/edit`} className="font-medium text-charcoal transition hover:text-forest">
                            Edit category
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-5">
              <Pagination
                currentPage={filters.page}
                totalPages={listResult.totalPages}
                baseParams={{
                  query: filters.query,
                  featured: filters.featured,
                  active: filters.active,
                  parent: filters.parent,
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
