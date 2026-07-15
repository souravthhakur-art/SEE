import { MediaForm } from "@/components/admin/media/MediaForm"
import { createMediaAction } from "@/app/admin/(dashboard)/media/actions"

export default function AdminNewMediaPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">New media</p>
        <h1 className="heading-lg text-charcoal">Create media</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Add a new asset to the library. It becomes immediately available for selection on the product form.
        </p>
      </div>

      <MediaForm mode="create" action={createMediaAction} cancelHref="/admin/media" />
    </div>
  )
}
