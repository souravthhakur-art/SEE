import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  COLLECTION_PAGE_SIZE,
  type CollectionActiveFilterOption,
  type CollectionFeaturedFilterOption,
  type CollectionFormValues,
  type CollectionProductOption,
  type CollectionSortOption,
} from "@/lib/admin/collection-form"

export interface CollectionListParams {
  page: number
  query: string
  featured: CollectionFeaturedFilterOption
  active: CollectionActiveFilterOption
  sort: CollectionSortOption
}

export interface CollectionListItem {
  id: string
  name: string
  slug: string
  description: string | null
  featured: boolean
  active: boolean
  displayOrder: number
  updatedAt: Date
  _count: { products: number }
}

export interface CollectionListResult {
  collections: CollectionListItem[]
  totalCount: number
  totalPages: number
}

export interface CollectionDetail {
  id: string
  name: string
  slug: string
  description: string | null
  featured: boolean
  active: boolean
  displayOrder: number
  image: string | null
  createdAt: Date
  updatedAt: Date
  products: Array<{
    id: string
    displayOrder: number
    product: { id: string; name: string; sku: string; status: "active" | "draft" | "archived"; slug: string }
  }>
}

export interface CollectionFormOptions {
  products: CollectionProductOption[]
}

export function parseCollectionListParams(
  raw: Partial<Record<string, string | string[] | undefined>>
): CollectionListParams {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page
  const rawQuery = Array.isArray(raw.query) ? raw.query[0] : raw.query
  const rawFeatured = Array.isArray(raw.featured) ? raw.featured[0] : raw.featured
  const rawActive = Array.isArray(raw.active) ? raw.active[0] : raw.active
  const rawSort = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort

  const page = Number.parseInt(rawPage ?? "1", 10)
  const normalizedFeatured = rawFeatured === "featured" || rawFeatured === "not-featured" ? rawFeatured : "all"
  const normalizedActive = rawActive === "active" || rawActive === "inactive" ? rawActive : "all"

  const sortOptions = new Set<CollectionSortOption>([
    "display-order-asc",
    "updated-desc",
    "created-desc",
    "created-asc",
    "name-asc",
    "name-desc",
    "product-count-desc",
  ])

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    query: (rawQuery ?? "").trim(),
    featured: normalizedFeatured,
    active: normalizedActive,
    sort: sortOptions.has((rawSort as CollectionSortOption) ?? "display-order-asc")
      ? ((rawSort as CollectionSortOption) ?? "display-order-asc")
      : "display-order-asc",
  }
}

function buildCollectionListWhere(params: CollectionListParams): Prisma.CollectionWhereInput {
  const where: Prisma.CollectionWhereInput = {}

  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: "insensitive" } },
      { slug: { contains: params.query, mode: "insensitive" } },
      { description: { contains: params.query, mode: "insensitive" } },
    ]
  }

  if (params.featured === "featured") {
    where.featured = true
  }

  if (params.featured === "not-featured") {
    where.featured = false
  }

  if (params.active === "active") {
    where.active = true
  }

  if (params.active === "inactive") {
    where.active = false
  }

  return where
}

function getCollectionListOrderBy(sort: CollectionSortOption): Prisma.CollectionOrderByWithRelationInput[] {
  switch (sort) {
    case "updated-desc":
      return [{ updatedAt: "desc" }]
    case "created-desc":
      return [{ createdAt: "desc" }]
    case "created-asc":
      return [{ createdAt: "asc" }]
    case "name-asc":
      return [{ name: "asc" }]
    case "name-desc":
      return [{ name: "desc" }]
    case "product-count-desc":
      return [{ products: { _count: "desc" } }, { name: "asc" }]
    case "display-order-asc":
    default:
      return [{ displayOrder: "asc" }, { name: "asc" }]
  }
}

export async function getCollectionList(params: CollectionListParams): Promise<CollectionListResult> {
  const where = buildCollectionListWhere(params)
  const skip = (params.page - 1) * COLLECTION_PAGE_SIZE

  const [totalCount, collections] = await prisma.$transaction([
    prisma.collection.count({ where }),
    prisma.collection.findMany({
      where,
      skip,
      take: COLLECTION_PAGE_SIZE,
      orderBy: getCollectionListOrderBy(params.sort),
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        active: true,
        displayOrder: true,
        updatedAt: true,
        _count: { select: { products: true } },
      },
    }),
  ])

  return {
    collections,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / COLLECTION_PAGE_SIZE)),
  }
}

export async function getCollectionFormOptions(): Promise<CollectionFormOptions> {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, sku: true, status: true },
  })

  return { products }
}

export async function getCollectionById(collectionId: string): Promise<CollectionDetail | null> {
  return prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      featured: true,
      active: true,
      displayOrder: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      products: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          displayOrder: true,
          product: { select: { id: true, name: true, sku: true, status: true, slug: true } },
        },
      },
    },
  })
}

export function mapCollectionToFormValues(collection: CollectionDetail): CollectionFormValues {
  return {
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? "",
    featured: collection.featured,
    active: collection.active,
    displayOrder: String(collection.displayOrder),
    image: collection.image ?? "",
    productIds: collection.products.map((entry) => entry.product.id),
  }
}

export function buildCollectionListQueryString(
  params: Partial<{
    page: number
    query: string
    featured: string
    active: string
    sort: string
  }>
) {
  const searchParams = new URLSearchParams()

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page))
  }

  if (params.query) {
    searchParams.set("query", params.query)
  }

  if (params.featured && params.featured !== "all") {
    searchParams.set("featured", params.featured)
  }

  if (params.active && params.active !== "all") {
    searchParams.set("active", params.active)
  }

  if (params.sort && params.sort !== "display-order-asc") {
    searchParams.set("sort", params.sort)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}
