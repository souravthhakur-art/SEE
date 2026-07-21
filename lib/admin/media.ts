import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  MEDIA_PAGE_SIZE,
  type MediaSortOption,
  type MediaUsageFilterOption,
} from "@/lib/admin/media-form"

export interface MediaListParams {
  page: number
  query: string
  usage: MediaUsageFilterOption
  sort: MediaSortOption
}

export interface MediaListItem {
  id: string
  url: string
  altText: string
  caption: string | null
  createdAt: Date
  updatedAt: Date
  _count: { productMedia: number }
}

export interface MediaListResult {
  media: MediaListItem[]
  totalCount: number
  totalPages: number
}

export interface MediaDetail {
  id: string
  url: string
  altText: string
  caption: string | null
  createdAt: Date
  updatedAt: Date
  productMedia: Array<{
    id: string
    role: "featured" | "gallery"
    displayOrder: number
    product: {
      id: string
      name: string
      slug: string
      status: "active" | "draft" | "archived"
    }
  }>
}

export interface ProductMediaOption {
  id: string
  url: string
  altText: string
  caption: string | null
}

export function parseMediaListParams(
  raw: Partial<Record<string, string | string[] | undefined>>
): MediaListParams {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page
  const rawQuery = Array.isArray(raw.query) ? raw.query[0] : raw.query
  const rawUsage = Array.isArray(raw.usage) ? raw.usage[0] : raw.usage
  const rawSort = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort

  const page = Number.parseInt(rawPage ?? "1", 10)
  const normalizedUsage = rawUsage === "used" || rawUsage === "unused" ? rawUsage : "all"

  const sortOptions = new Set<MediaSortOption>(["created-desc", "created-asc", "usage-desc", "alt-asc"])

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    query: (rawQuery ?? "").trim(),
    usage: normalizedUsage,
    sort: sortOptions.has((rawSort as MediaSortOption) ?? "created-desc")
      ? ((rawSort as MediaSortOption) ?? "created-desc")
      : "created-desc",
  }
}

function buildMediaListWhere(params: MediaListParams): Prisma.MediaWhereInput {
  const where: Prisma.MediaWhereInput = {}

  if (params.query) {
    where.OR = [
      { altText: { contains: params.query, mode: "insensitive" } },
      { url: { contains: params.query, mode: "insensitive" } },
      { caption: { contains: params.query, mode: "insensitive" } },
    ]
  }

  if (params.usage === "used") {
    where.productMedia = { some: {} }
  }

  if (params.usage === "unused") {
    where.productMedia = { none: {} }
  }

  return where
}

function getMediaListOrderBy(sort: MediaSortOption): Prisma.MediaOrderByWithRelationInput[] {
  switch (sort) {
    case "created-asc":
      return [{ createdAt: "asc" }]
    case "usage-desc":
      return [{ productMedia: { _count: "desc" } }, { createdAt: "desc" }]
    case "alt-asc":
      return [{ altText: "asc" }]
    case "created-desc":
    default:
      return [{ createdAt: "desc" }]
  }
}

export async function getMediaList(params: MediaListParams): Promise<MediaListResult> {
  try {
    const where = buildMediaListWhere(params)
    const skip = (params.page - 1) * MEDIA_PAGE_SIZE

    const [totalCount, media] = await prisma.$transaction([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        skip,
        take: MEDIA_PAGE_SIZE,
        orderBy: getMediaListOrderBy(params.sort),
        include: {
          _count: { select: { productMedia: true } },
        },
      }),
    ])

    return {
      media,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / MEDIA_PAGE_SIZE)),
    }
  } catch (error) {
    console.error("Failed to fetch media list from DB, using fallback:", error)
    return {
      media: [],
      totalCount: 0,
      totalPages: 1,
    }
  }
}

export async function getMediaById(mediaId: string): Promise<MediaDetail | null> {
  try {
    return await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        productMedia: {
          orderBy: [{ role: "asc" }, { displayOrder: "asc" }],
          include: {
            product: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error(`Failed to fetch media with ID ${mediaId} from DB, using fallback:`, error)
    return null
  }
}

export async function getMediaLibraryOptions(): Promise<ProductMediaOption[]> {
  try {
    return await prisma.media.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: { id: true, url: true, altText: true, caption: true },
    })
  } catch (error) {
    console.error("Failed to fetch media library options from DB, using fallback:", error)
    return []
  }
}

export function buildMediaListQueryString(
  params: Partial<{
    page: number
    query: string
    usage: string
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

  if (params.usage && params.usage !== "all") {
    searchParams.set("usage", params.usage)
  }

  if (params.sort && params.sort !== "created-desc") {
    searchParams.set("sort", params.sort)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}
