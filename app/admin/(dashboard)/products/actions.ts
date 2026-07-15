"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/lib/session"
import {
  INITIAL_PRODUCT_FORM_STATE,
  buildWeight,
  type ProductFormState,
} from "@/lib/admin/product-form"

const imageSchema = z.object({
  mediaId: z.string().trim().min(1, "Select a media asset."),
  isPrimary: z.boolean(),
})

const productPayloadSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
    shortDescription: z.string().trim().min(1, "Short description is required."),
    description: z.string().trim().min(1, "Description is required."),
    whyWeSelected: z.string().trim().min(1, "Why we selected it is required."),
    regionStory: z.string().trim().min(1, "Region story is required."),
    storage: z.string().trim().min(1, "Storage instructions are required."),
    shippingNote: z.string().trim().min(1, "Shipping note is required."),
    sku: z.string().trim().min(1, "SKU is required."),
    categoryId: z.string().trim().min(1, "Category is required."),
    producerName: z.string().trim(),
    producerType: z.enum(["shg", "farm", "cooperative", "estate", ""]),
    village: z.string().trim(),
    district: z.string().trim(),
    state: z.string().trim(),
    craftMethod: z.string().trim(),
    mrp: z.coerce.number({ message: "Enter a valid MRP." }).int().min(1, "MRP must be greater than 0."),
    sellingPrice: z.coerce
      .number({ message: "Enter a valid selling price." })
      .int()
      .min(1, "Selling price must be greater than 0."),
    costPrice: z.union([z.literal(""), z.coerce.number().int().min(0, "Cost price cannot be negative.")]),
    gstRate: z.coerce.number({ message: "Enter a valid GST value." }).min(0, "GST cannot be negative.").max(100, "GST must be 100 or less."),
    stockStatus: z.enum(["in_stock", "out_of_stock"]),
    status: z.enum(["active", "draft", "archived"]),
    featured: z.boolean(),
    weightValue: z.string().trim().min(1, "Weight is required."),
    unit: z.string().trim().min(1, "Unit is required."),
    displayOrder: z.coerce.number({ message: "Enter a valid display order." }).int().min(0, "Display order cannot be negative."),
    images: z.array(imageSchema),
    relatedProductIds: z.array(z.string()).default([]),
    collectionIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.sellingPrice > data.mrp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellingPrice"],
        message: "Selling price cannot be higher than MRP.",
      })
    }

    if (data.costPrice !== "" && typeof data.costPrice === "number" && data.costPrice > data.mrp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["costPrice"],
        message: "Cost price cannot be higher than MRP.",
      })
    }

    const hasSourceData = [data.producerName, data.producerType, data.village, data.district, data.state, data.craftMethod].some(
      (value) => value !== ""
    )

    if (hasSourceData) {
      if (!data.producerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["producerName"],
          message: "Producer name is required when source details are provided.",
        })
      }

      if (!data.producerType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["producerType"],
          message: "Producer type is required when source details are provided.",
        })
      }

      if (!data.district) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["district"],
          message: "District is required when source details are provided.",
        })
      }

      if (!data.state) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["state"],
          message: "State is required when source details are provided.",
        })
      }
    }
  })

type ProductPayload = z.infer<typeof productPayloadSchema>

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

function normalizeImages(images: ProductPayload["images"]) {
  const trimmedImages = images
    .map((image) => ({ ...image, mediaId: image.mediaId.trim() }))
    .filter((image) => image.mediaId)

  // A product shouldn't reference the same media asset twice — keep the
  // first occurrence's isPrimary/position, drop later duplicates.
  const seenMediaIds = new Set<string>()
  const cleanedImages = trimmedImages.filter((image) => {
    if (seenMediaIds.has(image.mediaId)) {
      return false
    }
    seenMediaIds.add(image.mediaId)
    return true
  })

  let primaryAssigned = false

  return cleanedImages.map((image, index) => {
    const isPrimary = image.isPrimary && !primaryAssigned
    primaryAssigned = primaryAssigned || isPrimary

    return {
      ...image,
      isPrimary: cleanedImages.length > 0 ? (primaryAssigned ? isPrimary : index === 0) : false,
      displayOrder: index,
    }
  })
}

function getFieldErrors(error: z.ZodError<ProductPayload>) {
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
  return productPayloadSchema.safeParse({
    name: getStringField(formData, "name"),
    slug: getStringField(formData, "slug"),
    shortDescription: getStringField(formData, "shortDescription"),
    description: getStringField(formData, "description"),
    whyWeSelected: getStringField(formData, "whyWeSelected"),
    regionStory: getStringField(formData, "regionStory"),
    storage: getStringField(formData, "storage"),
    shippingNote: getStringField(formData, "shippingNote"),
    sku: getStringField(formData, "sku"),
    categoryId: getStringField(formData, "categoryId"),
    producerName: getStringField(formData, "producerName"),
    producerType: getStringField(formData, "producerType"),
    village: getStringField(formData, "village"),
    district: getStringField(formData, "district"),
    state: getStringField(formData, "state"),
    craftMethod: getStringField(formData, "craftMethod"),
    mrp: getStringField(formData, "mrp"),
    sellingPrice: getStringField(formData, "sellingPrice"),
    costPrice: getStringField(formData, "costPrice"),
    gstRate: getStringField(formData, "gstRate"),
    stockStatus: getStringField(formData, "stockStatus"),
    status: getStringField(formData, "status"),
    featured: getBooleanField(formData, "featured"),
    weightValue: getStringField(formData, "weightValue"),
    unit: getStringField(formData, "unit"),
    displayOrder: getStringField(formData, "displayOrder"),
    images: parseJsonField(formData.get("images"), []),
    relatedProductIds: [...new Set(parseJsonField<string[]>(formData.get("relatedProductIds"), []))],
    collectionIds: [...new Set(parseJsonField<string[]>(formData.get("collectionIds"), []))],
  })
}

async function validateUniqueFields(payload: ProductPayload, currentProductId?: string) {
  const existing = await prisma.product.findFirst({
    where: {
      OR: [{ slug: payload.slug }, { sku: payload.sku }],
      ...(currentProductId ? { id: { not: currentProductId } } : {}),
    },
    select: {
      id: true,
      slug: true,
      sku: true,
    },
  })

  const fieldErrors: Record<string, string> = {}

  if (existing?.slug === payload.slug) {
    fieldErrors.slug = "This slug is already in use."
  }

  if (existing?.sku === payload.sku) {
    fieldErrors.sku = "This SKU is already in use."
  }

  return fieldErrors
}

async function persistProduct(payload: ProductPayload, currentProductId?: string) {
  const existingProduct = currentProductId
    ? await prisma.product.findUnique({
        where: { id: currentProductId },
        select: {
          id: true,
          stock: true,
          showInShop: true,
          subscriptionEligible: true,
          subscriptionPlans: true,
          lowStockThreshold: true,
          taxInclusive: true,
          attributes: true,
          ingredients: true,
          howToEnjoy: true,
          isLimited: true,
          hsnCode: true,
          shelfLife: true,
          batchNumber: true,
          fulfilledBy: true,
          harvestDate: true,
          packedDate: true,
          bestBefore: true,
          fssaiLicenseRef: true,
          regionImage: true,
        },
      })
    : null

  if (currentProductId && !existingProduct) {
    return null
  }

  const normalizedImages = normalizeImages(payload.images)
  const nextStock = payload.stockStatus === "out_of_stock" ? 0 : Math.max(existingProduct?.stock ?? 0, 1)

  const data = {
    name: payload.name,
    slug: payload.slug,
    shortDescription: payload.shortDescription,
    description: payload.description,
    whyWeSelected: payload.whyWeSelected,
    regionStory: payload.regionStory,
    storage: payload.storage,
    shippingNote: payload.shippingNote,
    sku: payload.sku,
    categoryId: payload.categoryId,
    mrp: payload.mrp,
    sellingPrice: payload.sellingPrice,
    costPrice: payload.costPrice === "" ? null : payload.costPrice,
    gstRate: payload.gstRate,
    stock: nextStock,
    status: payload.status,
    featured: payload.featured,
    weight: buildWeight(payload.weightValue, payload.unit),
    displayOrder: payload.displayOrder,
    originDistrict: payload.district || null,
    originState: payload.state || null,
    showInShop: existingProduct?.showInShop ?? true,
    subscriptionEligible: existingProduct?.subscriptionEligible ?? false,
    subscriptionPlans: existingProduct?.subscriptionPlans ?? [],
    lowStockThreshold: existingProduct?.lowStockThreshold ?? 0,
    taxInclusive: existingProduct?.taxInclusive ?? true,
    attributes: existingProduct?.attributes ?? [],
    ingredients: existingProduct?.ingredients ?? [],
    howToEnjoy: existingProduct?.howToEnjoy ?? [],
    isLimited: existingProduct?.isLimited ?? false,
    hsnCode: existingProduct?.hsnCode ?? null,
    shelfLife: existingProduct?.shelfLife ?? null,
    batchNumber: existingProduct?.batchNumber ?? null,
    fulfilledBy: existingProduct?.fulfilledBy ?? null,
    harvestDate: existingProduct?.harvestDate ?? null,
    packedDate: existingProduct?.packedDate ?? null,
    bestBefore: existingProduct?.bestBefore ?? null,
    fssaiLicenseRef: existingProduct?.fssaiLicenseRef ?? null,
    regionImage: existingProduct?.regionImage ?? null,
  }

  const hasSource = [payload.producerName, payload.producerType, payload.village, payload.district, payload.state, payload.craftMethod].some(
    (value) => value !== ""
  )

  return prisma.$transaction(async (tx) => {
    const product = currentProductId
      ? await tx.product.update({
          where: { id: currentProductId },
          data,
          select: { id: true },
        })
      : await tx.product.create({
          data,
          select: { id: true },
        })

    await tx.productMedia.deleteMany({ where: { productId: product.id } })
    if (normalizedImages.length > 0) {
      await tx.productMedia.createMany({
        data: normalizedImages.map((image) => ({
          productId: product.id,
          mediaId: image.mediaId,
          role: image.isPrimary ? "featured" : "gallery",
          displayOrder: image.displayOrder,
        })),
      })
    }

    await tx.relatedProduct.deleteMany({ where: { productId: product.id } })
    if (payload.relatedProductIds.length > 0) {
      await tx.relatedProduct.createMany({
        data: payload.relatedProductIds.map((relatedProductId, index) => ({
          productId: product.id,
          relatedProductId,
          displayOrder: index,
        })),
      })
    }

    // Collection membership is edited from both sides (this form and the
    // Collection form). displayOrder here means "this product's position
    // within that collection's storefront listing", which is shared state
    // owned by the Collection form. So unlike relatedProductIds above, we
    // don't blindly delete-and-recreate every row (that would scramble the
    // order every other product in the collection sits in). Instead we only
    // remove memberships that were unchecked and append newly-checked ones
    // to the end of their collection's existing order.
    const currentCollectionLinks = await tx.collectionProduct.findMany({
      where: { productId: product.id },
      select: { collectionId: true },
    })
    const currentCollectionIds = new Set(currentCollectionLinks.map((link) => link.collectionId))
    const desiredCollectionIds = new Set(payload.collectionIds)

    const collectionIdsToRemove = [...currentCollectionIds].filter((id) => !desiredCollectionIds.has(id))
    const collectionIdsToAdd = [...desiredCollectionIds].filter((id) => !currentCollectionIds.has(id))

    if (collectionIdsToRemove.length > 0) {
      await tx.collectionProduct.deleteMany({
        where: { productId: product.id, collectionId: { in: collectionIdsToRemove } },
      })
    }

    for (const collectionId of collectionIdsToAdd) {
      const highestExisting = await tx.collectionProduct.aggregate({
        where: { collectionId },
        _max: { displayOrder: true },
      })

      await tx.collectionProduct.create({
        data: {
          collectionId,
          productId: product.id,
          displayOrder: (highestExisting._max.displayOrder ?? -1) + 1,
        },
      })
    }

    if (hasSource && payload.producerType) {
      await tx.productSource.upsert({
        where: { productId: product.id },
        update: {
          village: payload.village || null,
          district: payload.district,
          state: payload.state,
          producerName: payload.producerName,
          producerType: payload.producerType,
          craftMethod: payload.craftMethod || null,
        },
        create: {
          productId: product.id,
          village: payload.village || null,
          district: payload.district,
          state: payload.state,
          producerName: payload.producerName,
          producerType: payload.producerType,
          craftMethod: payload.craftMethod || null,
        },
      })
    } else {
      await tx.productSource.deleteMany({ where: { productId: product.id } })
    }

    return product
  })
}

function successQuery(message: string) {
  return `success=${encodeURIComponent(message)}`
}

function refreshProductAdminPaths(productId?: string) {
  revalidatePath("/admin/products")
  revalidatePath("/admin/categories/collections")
  revalidatePath("/admin")

  if (productId) {
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/admin/products/${productId}/edit`)
  }
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const uniqueFieldErrors = await validateUniqueFields(parsedPayload.data)
  if (Object.keys(uniqueFieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: uniqueFieldErrors,
    }
  }

  const product = await persistProduct(parsedPayload.data)

  if (!product) {
    return {
      ...INITIAL_PRODUCT_FORM_STATE,
      message: "We could not create the product. Please try again.",
    }
  }

  refreshProductAdminPaths(product.id)
  redirect(`/admin/products/${product.id}?${successQuery("Product created successfully.")}`)
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdminSession()

  const parsedPayload = buildPayload(formData)

  if (!parsedPayload.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: getFieldErrors(parsedPayload.error),
    }
  }

  const uniqueFieldErrors = await validateUniqueFields(parsedPayload.data, productId)
  if (Object.keys(uniqueFieldErrors).length > 0) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: uniqueFieldErrors,
    }
  }

  const product = await persistProduct(parsedPayload.data, productId)

  if (!product) {
    return {
      ok: false,
      message: "That product no longer exists.",
      fieldErrors: {},
    }
  }

  refreshProductAdminPaths(product.id)
  redirect(`/admin/products/${product.id}?${successQuery("Product updated successfully.")}`)
}

export async function deleteProductAction(productId: string) {
  await requireAdminSession()

  await prisma.product.delete({ where: { id: productId } })

  refreshProductAdminPaths(productId)
  redirect(`/admin/products?${successQuery("Product deleted successfully.")}`)
}
