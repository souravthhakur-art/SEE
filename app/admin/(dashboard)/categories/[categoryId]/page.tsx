import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import { CategoryDeleteButton } from "@/components/admin/categories/CategoryDeleteButton"
import { CategoryStatusBadge } from "@/components/admin/categories/CategoryStatusBadge"
import { deleteCategoryAction } from "@/app/admin/(dashboard)/categories/actions"
import { getCategoryById } from "@/lib/admin/categories"

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

export default async function AdminCategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { categoryId } = await params
  const resolvedSearchParams = await searchParams
  const category = await getCategoryById(categoryId)

  if (!category) {
    notFound()
  }

  const success = Array.isArray(resolvedSearchParams.success) ? resolvedSearchParams.success[0] : resolvedSearchParams.success
  const error = Array.isArray(resolvedSearchParams.error) ? resolvedSearchParams.error[0] : resolvedSearchParams.error
  const deleteAction = deleteCategoryAction.bind(null, category.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="label text-wood">Category detail</p>
          <h1 className="heading-lg text-charcoal">{category.name}</h1>
          {category.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">{category.description}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CategoryStatusBadge active={category.active} />
            {category.featured ? (
              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-walnut">
                Featured
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/categories/${category.id}/edit`} className="btn-primary px-6 py-3 text-xs">
            <Pencil size={16} aria-hidden="true" />
            Edit category
          </Link>
          <CategoryDeleteButton categoryName={category.name} action={deleteAction} cancelHref={`/admin/categories/${category.id}`} />
        </div>
      </div>

      <SuccessNotice message={success} />
      <ErrorNotice message={error} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="space-y-6">
          <DetailCard title="Overview">
            <dl className="space-y-4">
              <DetailRow label="Slug" value={category.slug} />
              <DetailRow label="Parent category" value={category.parent ? <Link href={`/admin/categories/${category.parent.id}`} className="font-medium text-forest transition hover:text-forest-light">{category.parent.name}</Link> : "None (top-level)"} />
              <DetailRow label="Description" value={category.description ?? "—"} />
              <DetailRow label="Display order" value={category.displayOrder} />
            </dl>
          </DetailCard>

          <DetailCard title="Child categories">
            {category.children.length === 0 ? (
              <p className="text-sm text-wood">No child categories.</p>
            ) : (
              <ul className="space-y-2">
                {category.children.map((child) => (
                  <li key={child.id} className="rounded-sm border border-wood-light/20 bg-white px-4 py-3 text-sm text-charcoal">
                    <Link href={`/admin/categories/${child.id}`} className="font-medium text-charcoal transition hover:text-forest">
                      {child.name}
                    </Link>
                    <span className="ml-2 text-xs uppercase tracking-[0.14em] text-wood">{child.active ? "Active" : "Inactive"}</span>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>

          <DetailCard title="SEO">
            <dl className="space-y-4">
              <DetailRow label="SEO title" value={category.seoTitle ?? "—"} />
              <DetailRow label="SEO description" value={category.seoDescription ?? "—"} />
            </dl>
          </DetailCard>
        </div>

        <div className="space-y-6">
          <DetailCard title="Catalog">
            <dl className="space-y-4">
              <DetailRow label="Products in category" value={`${category._count.products} product${category._count.products === 1 ? "" : "s"}`} />
              <DetailRow label="Category image" value={category.image ? <img src={category.image} alt={category.name} className="h-24 w-24 rounded-sm border border-wood-light/20 object-cover" /> : "—"} />
            </dl>
          </DetailCard>

          <DetailCard title="Operational notes">
            <dl className="space-y-4">
              <DetailRow label="Created" value={category.createdAt.toLocaleString("en-IN")} />
              <DetailRow label="Last updated" value={category.updatedAt.toLocaleString("en-IN")} />
            </dl>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}
