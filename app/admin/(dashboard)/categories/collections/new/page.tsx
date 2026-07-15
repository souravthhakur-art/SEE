import { CategoryCollectionTabs } from "@/components/admin/categories/CategoryCollectionTabs"
import { CollectionForm } from "@/components/admin/collections/CollectionForm"
import { createCollectionAction } from "@/app/admin/(dashboard)/categories/collections/actions"
import { getCollectionFormOptions } from "@/lib/admin/collections"

export default async function AdminNewCollectionPage() {
  const { products } = await getCollectionFormOptions()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">New collection</p>
        <h1 className="heading-lg text-charcoal">Create collection</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Add a new merchandising collection without touching the storefront wiring. Collections reference Product
          ids via a join table, separate from the Category tree.
        </p>
      </div>

      <CategoryCollectionTabs active="collections" />

      <CollectionForm mode="create" action={createCollectionAction} products={products} cancelHref="/admin/categories/collections" />
    </div>
  )
}
