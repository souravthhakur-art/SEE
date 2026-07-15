"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/lib/session"
import type { MediaFormState } from "@/lib/admin/media-form"

const mediaPayloadSchema = z.object({
  url: z.string().trim().min(1, "URL is required."),
  altText: z.string().trim().min(1, "Alt text is required."),
  caption: z.string().trim().optional().default(""),
})

type MediaPayload = z.infer<typeof mediaPayloadSchema>

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getFieldErrors(error: z.ZodError<MediaPayload>) {
  const fieldErrors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form"
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }

  return fieldErrors
}

function buildPayload(formData: FormData) {
  return mediaPayloadSchema.safeParse({
    url: getStringField(formData, "url"),
    altText: getStringField(formData, "altText"),
    caption: getStringField(formData, "caption"),
  })
}

async function validateMediaPayload(payload: MediaPayload, currentMediaId?: string) {
  const fieldErrors: Record<string, string> = {}

  const existingUrl = await prisma.media.findFirst({
    where: {
      url: payload.url,
      ...(currentMediaId ? { id: { not: currentMediaId } } : {}),
    },
    select: { id: true },
  })

  if (existingUrl) {
    fieldErrors.url = "This URL is already in the library."
  }

  return fieldErrors
}

function buildMediaData(payload: MediaPayload) {
  return {
    url: payload.url,
    altText: payload.altText,
    caption: payload.caption || null,
  }
}

function successQuery(message: string) {
  return `success=${encodeURIComponent(message)}`
}

function errorQuery(message: string) {
  return `error=${encodeURIComponent(message)}`
}

function refreshMediaAdminPaths(mediaId?: string) {
  revalidatePath("/admin/media")
  revalidatePath("/admin/products")

  if (mediaId) {
    revalidatePath(`/admin/media/${mediaId}`)
    revalidatePath(`/admin/media/${mediaId}/edit`)
  }
}

export async function createMediaAction(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateMediaPayload(parsedPayload.data)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const media = await prisma.media.create({
    data: buildMediaData(parsedPayload.data),
    select: { id: true },
  })

  refreshMediaAdminPaths(media.id)
  redirect(`/admin/media/${media.id}?${successQuery("Media asset created successfully.")}`)
}

export async function updateMediaAction(
  mediaId: string,
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateMediaPayload(parsedPayload.data, mediaId)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const existing = await prisma.media.findUnique({ where: { id: mediaId }, select: { id: true } })

  if (!existing) {
    return {
      ok: false,
      message: "That media asset no longer exists.",
      fieldErrors: {},
    }
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: buildMediaData(parsedPayload.data),
  })

  refreshMediaAdminPaths(mediaId)
  redirect(`/admin/media/${mediaId}?${successQuery("Media asset updated successfully.")}`)
}

export async function deleteMediaAction(mediaId: string) {
  await requireAdminSession()

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: {
      _count: { select: { productMedia: true } },
    },
  })

  if (!media) {
    redirect(`/admin/media?${errorQuery("That media asset no longer exists.")}`)
  }

  if (media._count.productMedia > 0) {
    redirect(
      `/admin/media/${mediaId}?${errorQuery(
        `This asset is still used by ${media._count.productMedia} product${media._count.productMedia === 1 ? "" : "s"}. Remove it from those products first.`
      )}`
    )
  }

  await prisma.media.delete({ where: { id: mediaId } })

  refreshMediaAdminPaths(mediaId)
  redirect(`/admin/media?${successQuery("Media asset deleted successfully.")}`)
}
