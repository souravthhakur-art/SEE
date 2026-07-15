import Link from "next/link"
import { Plus, Layers } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"
import { CategoryCollectionTabs } from "@/components/admin/categories/CategoryCollectionTabs"
import { CollectionFilters } from "@/components/admin/collections/CollectionFilters"
import { CollectionStatusBadge } from "@/components/admin/collections/CollectionStatusBadge"
import { buildCollectionListQueryString, getCollectionList, parseCollectionListParams } from "@/lib/admin/collections"

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
          href={`/admin/categories/collections${buildCollectionListQueryString({ ...baseParams, page: Math.max(1, currentPage - 1) })}`}
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
          href={`/admin/categories/collections${buildCollectionListQueryString({ ...baseParams, page: Math.min(totalPages, currentPage + 1) })}`}
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

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const filters = parseCollectionListParams(resolvedSearchParams)
  const listResult = await getCollectionList(filters)
  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Sprint 2.2</p>
          <h1 className="heading-lg text-charcoal">Categories & Collections</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">
            Manage merchandising Collections: curated groups of products that reference Product ids via a join table,
            separate from the Category tree (see DEC-008).
          </p>
        </div>

        <Link href="/admin/categories/collections/new" className="btn-primary px-6 py-3 text-xs">
          <Plus size={16} aria-hidden="true" />
          Create collection
        </Link>
      </div>

      <CategoryCollectionTabs active="collections" />

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <CollectionFilters filters={filters} />

      <section className="rounded-sm border border-wood-light/30 bg-ivory">
        <div className="flex items-center justify-between border-b border-wood-light/20 px-5 py-4">
          <div>
            <p className="label text-wood">Collections</p>
            <p className="mt-1 text-sm text-charcoal">
              {listResult.totalCount} collection{listResult.totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {listResult.collections.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Layers}
              title={listResult.totalCount === 0 ? "No collections yet" : "No collections match these filters"}
              description={
                listResult.totalCount === 0
                  ? "Create the first collection to start curating merchandising groups of products."
                  : "Adjust search, featured, status, or sorting to widen the result set."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-wood-light/20">
                <thead>
                  <tr className="bg-ivory-dark/70 text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Collection</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Products</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Status</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Updated</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-light/15">
                  {listResult.collections.map((collection) => (
                    <tr key={collection.id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="min-w-[240px] space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/categories/collections/${collection.id}`} className="font-medium text-charcoal transition hover:text-forest">
                              {collection.name}
                            </Link>
                            {collection.featured ? (
                              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          {collection.description ? <p className="text-sm text-wood">{collection.description}</p> : null}
                          <p className="text-xs uppercase tracking-[0.14em] text-wood-light">{collection.slug}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-charcoal">
                        {collection._count.products} product{collection._count.products === 1 ? "" : "s"}
                      </td>
                      <td className="px-5 py-4 text-sm text-charcoal">
                        <CollectionStatusBadge active={collection.active} />
                      </td>
                      <td className="px-5 py-4 text-sm text-wood">
                        <div>{collection.updatedAt.toLocaleDateString("en-IN")}</div>
                        <div className="text-xs text-wood-light">Display #{collection.displayOrder}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex min-w-[180px] flex-col gap-2">
                          <Link href={`/admin/categories/collections/${collection.id}`} className="font-medium text-forest transition hover:text-forest-light">
                            View details
                          </Link>
                          <Link href={`/admin/categories/collections/${collection.id}/edit`} className="font-medium text-charcoal transition hover:text-forest">
                            Edit collection
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
