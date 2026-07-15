import Link from "next/link"
import { Plus, Image as ImageIcon } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"
import { MediaFilters } from "@/components/admin/media/MediaFilters"
import { MediaStatusBadge } from "@/components/admin/media/MediaStatusBadge"
import { buildMediaListQueryString, getMediaList, parseMediaListParams } from "@/lib/admin/media"

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
    usage: string
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
          href={`/admin/media${buildMediaListQueryString({ ...baseParams, page: Math.max(1, currentPage - 1) })}`}
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
          href={`/admin/media${buildMediaListQueryString({ ...baseParams, page: Math.min(totalPages, currentPage + 1) })}`}
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

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const filters = parseMediaListParams(resolvedSearchParams)
  const listResult = await getMediaList(filters)
  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Sprint 2.3</p>
          <h1 className="heading-lg text-charcoal">Media Library</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">
            Central, reusable image assets for products — URL-based only in this release (no uploads, CDN, or
            optimisation pipeline). Attach assets to products from the product editor&apos;s Images section.
          </p>
        </div>

        <Link href="/admin/media/new" className="btn-primary px-6 py-3 text-xs">
          <Plus size={16} aria-hidden="true" />
          Create media
        </Link>
      </div>

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <MediaFilters filters={filters} />

      <section className="rounded-sm border border-wood-light/30 bg-ivory">
        <div className="flex items-center justify-between border-b border-wood-light/20 px-5 py-4">
          <div>
            <p className="label text-wood">Media</p>
            <p className="mt-1 text-sm text-charcoal">
              {listResult.totalCount} asset{listResult.totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {listResult.media.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={ImageIcon}
              title={listResult.totalCount === 0 ? "No media yet" : "No media match these filters"}
              description={
                listResult.totalCount === 0
                  ? "Add the first media asset to start building the library. Products can then pick from it instead of typing URLs by hand."
                  : "Adjust search, usage, or sorting to widen the result set."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-wood-light/20">
                <thead>
                  <tr className="bg-ivory-dark/70 text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Preview</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Alt text / URL</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Usage</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Updated</th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-wood">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-light/15">
                  {listResult.media.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-5 py-4">
                        <img
                          src={item.url}
                          alt={item.altText}
                          className="h-16 w-16 rounded-sm border border-wood-light/20 object-cover"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="min-w-[240px] space-y-1">
                          <Link href={`/admin/media/${item.id}`} className="font-medium text-charcoal transition hover:text-forest">
                            {item.altText}
                          </Link>
                          {item.caption ? <p className="text-sm text-wood">{item.caption}</p> : null}
                          <p className="truncate text-xs uppercase tracking-[0.14em] text-wood-light" title={item.url}>
                            {item.url}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-charcoal">
                        <MediaStatusBadge usageCount={item._count.productMedia} />
                      </td>
                      <td className="px-5 py-4 text-sm text-wood">{item.updatedAt.toLocaleDateString("en-IN")}</td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex min-w-[160px] flex-col gap-2">
                          <Link href={`/admin/media/${item.id}`} className="font-medium text-forest transition hover:text-forest-light">
                            View details
                          </Link>
                          <Link href={`/admin/media/${item.id}/edit`} className="font-medium text-charcoal transition hover:text-forest">
                            Edit media
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
                  usage: filters.usage,
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
