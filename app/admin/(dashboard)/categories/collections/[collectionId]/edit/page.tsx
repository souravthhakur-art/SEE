import { notFound } from "next/navigation"
import { CollectionForm } from "@/components/admin/collections/CollectionForm"
import { updateCollectionAction } from "@/app/admin/(dashboard)/categories/collections/actions"
import { getCollectionById, getCollectionFormOptions, mapCollectionToFormValues } from "@/lib/admin/collections"

export default async function AdminEditCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>
}) {
  const { collectionId } = await params
  const [collection, { products }] = await Promise.all([getCollectionById(collectionId), getCollectionFormOptions()])

  if (!collection) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">Edit collection</p>
        <h1 className="heading-lg text-charcoal">{collection.name}</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Update the collection while preserving the current admin dashboard architecture and Prisma schema.
        </p>
      </div>

      <CollectionForm
        mode="edit"
        action={updateCollectionAction.bind(null, collection.id)}
        products={products}
        initialValues={mapCollectionToFormValues(collection)}
        cancelHref={`/admin/categories/collections/${collection.id}`}
      />
    </div>
  )
}
