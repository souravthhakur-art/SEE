import { notFound } from "next/navigation"
import { MediaForm } from "@/components/admin/media/MediaForm"
import { updateMediaAction } from "@/app/admin/(dashboard)/media/actions"
import { getMediaById } from "@/lib/admin/media"

export default async function AdminEditMediaPage({
  params,
}: {
  params: Promise<{ mediaId: string }>
}) {
  const { mediaId } = await params
  const media = await getMediaById(mediaId)

  if (!media) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="label text-wood">Edit media</p>
        <h1 className="heading-lg text-charcoal">{media.altText}</h1>
        <p className="max-w-3xl text-sm leading-6 text-wood">
          Update this asset. Changing the URL keeps the same asset record — products already using it don&apos;t
          need to be reattached.
        </p>
      </div>

      <MediaForm
        mode="edit"
        action={updateMediaAction.bind(null, media.id)}
        initialValues={{ url: media.url, altText: media.altText, caption: media.caption ?? "" }}
        cancelHref={`/admin/media/${media.id}`}
      />
    </div>
  )
}
