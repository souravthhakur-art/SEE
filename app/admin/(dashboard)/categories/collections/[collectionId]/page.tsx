import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import { CollectionDeleteButton } from "@/components/admin/collections/CollectionDeleteButton"
import { CollectionStatusBadge } from "@/components/admin/collections/CollectionStatusBadge"
import { deleteCollectionAction } from "@/app/admin/(dashboard)/categories/collections/actions"
import { getCollectionById } from "@/lib/admin/collections"

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

export default async function AdminCollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ collectionId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { collectionId } = await params
  const resolvedSearchParams = await searchParams
  const collection = await getCollectionById(collectionId)

  if (!collection) {
    notFound()
  }

  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error
  const deleteAction = deleteCollectionAction.bind(null, collection.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Collection detail</p>
          <h1 className="heading-lg text-charcoal">{collection.name}</h1>
          {collection.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">{collection.description}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CollectionStatusBadge active={collection.active} />
            {collection.featured ? (
              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                Featured
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/categories/collections/${collection.id}/edit`} className="btn-primary px-6 py-3 text-xs">
            <Pencil size={16} aria-hidden="true" />
            Edit collection
          </Link>
          <CollectionDeleteButton
            collectionName={collection.name}
            action={deleteAction}
            cancelHref={`/admin/categories/collections/${collection.id}`}
          />
        </div>
      </div>

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="space-y-6">
          <DetailCard title="Overview">
            <dl className="space-y-4">
              <DetailRow label="Slug" value={collection.slug} />
              <DetailRow label="Description" value={collection.description ?? "—"} />
              <DetailRow label="Display order" value={collection.displayOrder} />
            </dl>
          </DetailCard>

          <DetailCard title="Products">
            {collection.products.length === 0 ? (
              <p className="text-sm text-wood">No products assigned yet.</p>
            ) : (
              <ul className="space-y-2">
                {collection.products.map((entry) => (
                  <li key={entry.id} className="rounded-sm border border-wood-light/20 bg-white px-4 py-3 text-sm text-charcoal">
                    <Link href={`/admin/products/${entry.product.id}`} className="font-medium text-charcoal transition hover:text-forest">
                      {entry.product.name}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-wood">
                      {entry.product.sku} · {entry.product.status} · {entry.product.slug}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Merchandising">
            <dl className="space-y-4">
              <DetailRow label="Products in collection" value={`${collection.products.length} product${collection.products.length === 1 ? "" : "s"}`} />
              <DetailRow label="Collection image" value={collection.image ? <img src={collection.image} alt={collection.name} className="h-24 w-24 rounded-sm border border-wood-light/20 object-cover" /> : "—"} />
            </dl>
          </DetailCard>

          <DetailCard title="Operational notes">
            <dl className="space-y-4">
              <DetailRow label="Created" value={collection.createdAt.toLocaleString("en-IN")} />
              <DetailRow label="Last updated" value={collection.updatedAt.toLocaleString("en-IN")} />
            </dl>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
