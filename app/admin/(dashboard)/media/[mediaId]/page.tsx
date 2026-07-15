import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import { MediaDeleteButton } from "@/components/admin/media/MediaDeleteButton"
import { MediaStatusBadge } from "@/components/admin/media/MediaStatusBadge"
import { deleteMediaAction } from "@/app/admin/(dashboard)/media/actions"
import { getMediaById } from "@/lib/admin/media"

function SuccessNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-forest/25 bg-forest/10 px-4 py-3 text-sm text-forest">{message}</div>
}

function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null

  return <div className="rounded-sm border border-red-700/25 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
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

function RoleBadge({ role }: { role: "featured" | "gallery" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
        role === "featured" ? "border-gold/30 bg-gold/10 text-walnut" : "border-wood-light/30 bg-ivory-dark text-wood"
      }`}
    >
      {role === "featured" ? "Featured" : "Gallery"}
    </span>
  )
}

export default async function AdminMediaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ mediaId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { mediaId } = await params
  const resolvedSearchParams = await searchParams
  const media = await getMediaById(mediaId)

  if (!media) {
    notFound()
  }

  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error
  const deleteAction = deleteMediaAction.bind(null, media.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Media detail</p>
          <h1 className="heading-lg text-charcoal">{media.altText}</h1>
          {media.caption ? <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">{media.caption}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MediaStatusBadge usageCount={media.productMedia.length} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/media/${media.id}/edit`} className="btn-primary px-6 py-3 text-xs">
            <Pencil size={16} aria-hidden="true" />
            Edit media
          </Link>
          <MediaDeleteButton mediaLabel={media.altText} action={deleteAction} cancelHref={`/admin/media/${media.id}`} />
        </div>
      </div>

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="space-y-6">
          <DetailCard title="Preview">
            <img
              src={media.url}
              alt={media.altText}
              className="aspect-square w-full rounded-sm border border-wood-light/20 object-cover"
            />
          </DetailCard>

          <DetailCard title="Overview">
            <dl className="space-y-4">
              <DetailRow label="URL" value={<span className="break-all">{media.url}</span>} />
              <DetailRow label="Alt text" value={media.altText} />
              <DetailRow label="Caption" value={media.caption ?? "—"} />
            </dl>
          </DetailCard>

          <DetailCard title="Operational notes">
            <dl className="space-y-4">
              <DetailRow label="Created" value={media.createdAt.toLocaleString("en-IN")} />
              <DetailRow label="Last updated" value={media.updatedAt.toLocaleString("en-IN")} />
            </dl>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Used by">
            {media.productMedia.length === 0 ? (
              <p className="text-sm text-wood">Not currently used by any product. It can be safely deleted.</p>
            ) : (
              <ul className="space-y-2">
                {media.productMedia.map((usage) => (
                  <li
                    key={usage.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-wood-light/20 bg-white px-4 py-3 text-sm text-charcoal"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/products/${usage.product.id}`} className="font-medium text-charcoal transition hover:text-forest">
                        {usage.product.name}
                      </Link>
                      <span className="text-xs uppercase tracking-[0.14em] text-wood">{usage.product.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={usage.role} />
                      <span className="text-xs text-wood-light">#{usage.displayOrder}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
