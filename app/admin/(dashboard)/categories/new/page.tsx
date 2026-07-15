import { CategoryCollectionTabs } from "@/components/admin/categories/CategoryCollectionTabs"
import { CategoryForm } from "@/components/admin/categories/CategoryForm"
import { createCategoryAction } from "@/app/admin/(dashboard)/categories/actions"
import { getCategoryFormOptions } from "@/lib/admin/categories"

export default async function AdminNewCategoryPage() {
  const { parentOptions } = await getCategoryFormOptions()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">New category</p>
        <h1 className="heading-lg text-charcoal">Create category</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Add a new database-backed category. It becomes immediately available for assignment on the product form.
        </p>
      </div>

      <CategoryCollectionTabs active="categories" />

      <CategoryForm mode="create" action={createCategoryAction} parentOptions={parentOptions} cancelHref="/admin/categories" />
    </div>
  )
}
