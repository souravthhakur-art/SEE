"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/lib/session"
import type { CategoryFormState } from "@/lib/admin/category-form"

const categoryPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().trim().optional().default(""),
  parentId: z.string().trim().optional().default(""),
  featured: z.boolean(),
  active: z.boolean(),
  displayOrder: z.coerce.number({ message: "Enter a valid display order." }).int().min(0, "Display order cannot be negative."),
  image: z.string().trim().optional().default(""),
  seoTitle: z.string().trim().optional().default(""),
  seoDescription: z.string().trim().optional().default(""),
})

type CategoryPayload = z.infer<typeof categoryPayloadSchema>

function getBooleanField(formData: FormData, key: string) {
  return formData.get(key) === "on"
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getFieldErrors(error: z.ZodError<CategoryPayload>) {
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
  return categoryPayloadSchema.safeParse({
    name: getStringField(formData, "name"),
    slug: getStringField(formData, "slug"),
    description: getStringField(formData, "description"),
    parentId: getStringField(formData, "parentId"),
    featured: getBooleanField(formData, "featured"),
    active: getBooleanField(formData, "active"),
    displayOrder: getStringField(formData, "displayOrder"),
    image: getStringField(formData, "image"),
    seoTitle: getStringField(formData, "seoTitle"),
    seoDescription: getStringField(formData, "seoDescription"),
  })
}

// Walks up the parent chain starting at `parentId` looking for `categoryId`.
// Catches both direct self-reference and deeper cycles (assigning a
// category under one of its own descendants).
async function wouldCreateCycle(categoryId: string, parentId: string): Promise<boolean> {
  let currentId: string | null = parentId

  while (currentId) {
    if (currentId === categoryId) {
      return true
    }

    const current: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })

    currentId = current?.parentId ?? null
  }

  return false
}

async function validateCategoryPayload(payload: CategoryPayload, currentCategoryId?: string) {
  const fieldErrors: Record<string, string> = {}

  const existingSlug = await prisma.category.findFirst({
    where: {
      slug: payload.slug,
      ...(currentCategoryId ? { id: { not: currentCategoryId } } : {}),
    },
    select: { id: true },
  })

  if (existingSlug) {
    fieldErrors.slug = "This slug is already in use."
  }

  if (payload.parentId) {
    if (!currentCategoryId) {
      const parentExists = await prisma.category.findUnique({ where: { id: payload.parentId }, select: { id: true } })
      if (!parentExists) {
        fieldErrors.parentId = "Select a valid parent category."
      }
    } else if (payload.parentId === currentCategoryId) {
      fieldErrors.parentId = "A category cannot be its own parent."
    } else if (await wouldCreateCycle(currentCategoryId, payload.parentId)) {
      fieldErrors.parentId = "A category cannot be moved under one of its own child categories."
    }
  }

  return fieldErrors
}

function buildCategoryData(payload: CategoryPayload) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    parentId: payload.parentId || null,
    featured: payload.featured,
    active: payload.active,
    displayOrder: payload.displayOrder,
    image: payload.image || null,
    seoTitle: payload.seoTitle || null,
    seoDescription: payload.seoDescription || null,
  }
}

function successQuery(message: string) {
  return `success=${encodeURIComponent(message)}`
}

function errorQuery(message: string) {
  return `error=${encodeURIComponent(message)}`
}

function refreshCategoryAdminPaths(categoryId?: string) {
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")

  if (categoryId) {
    revalidatePath(`/admin/categories/${categoryId}`)
    revalidatePath(`/admin/categories/${categoryId}/edit`)
  }
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateCategoryPayload(parsedPayload.data)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const category = await prisma.category.create({
    data: buildCategoryData(parsedPayload.data),
    select: { id: true },
  })

  refreshCategoryAdminPaths(category.id)
  redirect(`/admin/categories/${category.id}?${successQuery("Category created successfully.")}`)
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const fieldErrors = await validateCategoryPayload(parsedPayload.data, categoryId)
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    }
  }

  const existing = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } })

  if (!existing) {
    return {
      ok: false,
      message: "That category no longer exists.",
      fieldErrors: {},
    }
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: buildCategoryData(parsedPayload.data),
  })

  refreshCategoryAdminPaths(categoryId)
  redirect(`/admin/categories/${categoryId}?${successQuery("Category updated successfully.")}`)
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdminSession()

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      _count: { select: { products: true, children: true } },
    },
  })

  if (!category) {
    redirect(`/admin/categories?${errorQuery("That category no longer exists.")}`)
  }

  if (category._count.products > 0) {
    redirect(
      `/admin/categories/${categoryId}?${errorQuery(
        `This category still has ${category._count.products} product${category._count.products === 1 ? "" : "s"} assigned to it. Move or reassign those products before deleting the category.`
      )}`
    )
  }

  if (category._count.children > 0) {
    redirect(
      `/admin/categories/${categoryId}?${errorQuery(
        `This category still has ${category._count.children} child categor${category._count.children === 1 ? "y" : "ies"}. Move or delete those first.`
      )}`
    )
  }

  await prisma.category.delete({ where: { id: categoryId } })

  refreshCategoryAdminPaths(categoryId)
  redirect(`/admin/categories?${successQuery("Category deleted successfully.")}`)
}
