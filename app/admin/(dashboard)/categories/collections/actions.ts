"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/lib/session"
import type { CollectionFormState } from "@/lib/admin/collection-form"

const collectionPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().trim().optional().default(""),
  featured: z.boolean(),
  active: z.boolean(),
  displayOrder: z.coerce.number({ message: "Enter a valid display order." }).int().min(0, "Display order cannot be negative."),
  image: z.string().trim().optional().default(""),
  productIds: z.array(z.string()).default([]),
})

type CollectionPayload = z.infer<typeof collectionPayloadSchema>

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getBooleanField(formData: FormData, key: string) {
  return formData.get(key) === "on"
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getFieldErrors(error: z.ZodError<CollectionPayload>) {
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
  return collectionPayloadSchema.safeParse({
    name: getStringField(formData, "name"),
    slug: getStringField(formData, "slug"),
    description: getStringField(formData, "description"),
    featured: getBooleanField(formData, "featured"),
    active: getBooleanField(formData, "active"),
    displayOrder: getStringField(formData, "displayOrder"),
    image: getStringField(formData, "image"),
    productIds: [...new Set(parseJsonField<string[]>(formData.get("productIds"), []))],
  })
}

async function validateUniqueSlug(payload: CollectionPayload, currentCollectionId?: string) {
  const existing = await prisma.collection.findFirst({
    where: {
      slug: payload.slug,
      ...(currentCollectionId ? { id: { not: currentCollectionId } } : {}),
    },
    select: { id: true },
  })

  const fieldErrors: Record<string, string> = {}

  if (existing) {
    fieldErrors.slug = "This slug is already in use."
  }

  return fieldErrors
}

function buildCollectionData(payload: CollectionPayload) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    featured: payload.featured,
    active: payload.active,
    displayOrder: payload.displayOrder,
    image: payload.image || null,
  }
}

async function persistCollection(payload: CollectionPayload, currentCollectionId?: string) {
  return prisma.$transaction(async (tx) => {
    const collection = currentCollectionId
      ? await tx.collection.update({
          where: { id: currentCollectionId },
          data: buildCollectionData(payload),
          select: { id: true },
        })
      : await tx.collection.create({
          data: buildCollectionData(payload),
          select: { id: true },
        })

    await tx.collectionProduct.deleteMany({ where: { collectionId: collection.id } })
    if (payload.productIds.length > 0) {
      await tx.collectionProduct.createMany({
        data: payload.productIds.map((productId, index) => ({
          collectionId: collection.id,
          productId,
          displayOrder: index,
        })),
      })
    }

    return collection
  })
}

function successQuery(message: string) {
  return `success=${encodeURIComponent(message)}`
}

function errorQuery(message: string) {
  return `error=${encodeURIComponent(message)}`
}

function refreshCollectionAdminPaths(collectionId?: string) {
  revalidatePath("/admin/categories/collections")
  revalidatePath("/admin/products")

  if (collectionId) {
    revalidatePath(`/admin/categories/collections/${collectionId}`)
    revalidatePath(`/admin/categories/collections/${collectionId}/edit`)
  }
}

export async function createCollectionAction(
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateUniqueSlug(parsedPayload.data)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const collection = await persistCollection(parsedPayload.data)

  refreshCollectionAdminPaths(collection.id)
  redirect(`/admin/categories/collections/${collection.id}?${successQuery("Collection created successfully.")}`)
}

export async function updateCollectionAction(
  collectionId: string,
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateUniqueSlug(parsedPayload.data, collectionId)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const existing = await prisma.collection.findUnique({ where: { id: collectionId }, select: { id: true } })

  if (!existing) {
    return {
      ok: false,
      message: "That collection no longer exists.",
      fieldErrors: {},
    }
  }

  const collection = await persistCollection(parsedPayload.data, collectionId)

  refreshCollectionAdminPaths(collection.id)
  redirect(`/admin/categories/collections/${collection.id}?${successQuery("Collection updated successfully.")}`)
}

export async function deleteCollectionAction(collectionId: string) {
  await requireAdminSession()

  const existing = await prisma.collection.findUnique({ where: { id: collectionId }, select: { id: true } })

  if (!existing) {
    redirect(`/admin/categories/collections?${errorQuery("That collection no longer exists.")}`)
  }

  await prisma.collection.delete({ where: { id: collectionId } })

  refreshCollectionAdminPaths(collectionId)
  redirect(`/admin/categories/collections?${successQuery("Collection deleted successfully.")}`)
}
