import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/categories/CategoryForm"
import { updateCategoryAction } from "@/app/admin/(dashboard)/categories/actions"
import { getCategoryById, getCategoryFormOptions, mapCategoryToFormValues } from "@/lib/admin/categories"

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const [category, { parentOptions }] = await Promise.all([
    getCategoryById(categoryId),
    getCategoryFormOptions(categoryId),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">Edit category</p>
        <h1 className="heading-lg text-charcoal">{category.name}</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Update the category while preserving the current admin dashboard architecture and Prisma schema.
        </p>
      </div>

      <CategoryForm
        mode="edit"
        action={updateCategoryAction.bind(null, category.id)}
        parentOptions={parentOptions}
        initialValues={mapCategoryToFormValues(category)}
        cancelHref={`/admin/categories/${category.id}`}
      />
    </div>
  )
}
