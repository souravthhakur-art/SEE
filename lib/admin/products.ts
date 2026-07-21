import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  PRODUCT_PAGE_SIZE,
  type FeaturedFilterOption,
  type ProductCategoryOption,
  type ProductCollectionOption,
  type ProductFormValues,
  type ProductRelationOption,
  type ProductSortOption,
  splitWeight,
  getDerivedStockStatus,
} from "@/lib/admin/product-form"
import { getMediaLibraryOptions, type ProductMediaOption } from "@/lib/admin/media"

export interface ProductListParams {
  page: number
  query: string
  status: "all" | "active" | "draft" | "archived"
  category: string
  featured: FeaturedFilterOption
  sort: ProductSortOption
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  shortDescription: string
  sellingPrice: number
  mrp: number
  featured: boolean
  status: "active" | "draft" | "archived"
  stock: number
  displayOrder: number
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  source: {
    producerName: string
    district: string
    state: string
  } | null
  images: Array<{
    url: string
    altText: string
    isPrimary: boolean
  }>
}

export interface ProductListResult {
  products: ProductListItem[]
  totalCount: number
  totalPages: number
}

export interface ProductDetail {
  id: string
  categoryId: string
  name: string
  slug: string
  shortDescription: string
  description: string
  whyWeSelected: string
  regionStory: string
  storage: string
  shippingNote: string
  sku: string
  mrp: number
  sellingPrice: number
  costPrice: number | null
  gstRate: Prisma.Decimal
  stock: number
  status: "active" | "draft" | "archived"
  featured: boolean
  weight: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  source: {
    village: string | null
    district: string
    state: string
    producerName: string
    producerType: "shg" | "farm" | "cooperative" | "estate"
    craftMethod: string | null
  } | null
  images: Array<{
    id: string
    mediaId: string
    url: string
    altText: string
    caption: string | null
    displayOrder: number
    isPrimary: boolean
  }>
  relatedProducts: Array<{
    id: string
    displayOrder: number
    relatedProduct: {
      id: string
      name: string
      sku: string
      status: "active" | "draft" | "archived"
      slug: string
    }
  }>
  collections: Array<{
    id: string
    displayOrder: number
    collection: {
      id: string
      name: string
      slug: string
    }
  }>
}

export interface ProductFormOptions {
  categories: ProductCategoryOption[]
  relatedProducts: ProductRelationOption[]
  collections: ProductCollectionOption[]
  mediaOptions: ProductMediaOption[]
}

export function parseProductListParams(
  raw: Partial<Record<string, string | string[] | undefined>>
): ProductListParams {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page
  const rawQuery = Array.isArray(raw.query) ? raw.query[0] : raw.query
  const rawStatus = Array.isArray(raw.status) ? raw.status[0] : raw.status
  const rawCategory = Array.isArray(raw.category) ? raw.category[0] : raw.category
  const rawFeatured = Array.isArray(raw.featured) ? raw.featured[0] : raw.featured
  const rawSort = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort

  const page = Number.parseInt(rawPage ?? "1", 10)
  const normalizedStatus = rawStatus === "active" || rawStatus === "draft" || rawStatus === "archived" ? rawStatus : "all"
  const normalizedFeatured = rawFeatured === "featured" || rawFeatured === "not-featured" ? rawFeatured : "all"

  const sortOptions = new Set<ProductSortOption>([
    "updated-desc",
    "created-desc",
    "created-asc",
    "name-asc",
    "name-desc",
    "price-desc",
    "price-asc",
    "display-order-asc",
  ])

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    query: (rawQuery ?? "").trim(),
    status: normalizedStatus,
    category: (rawCategory ?? "all").trim(),
    featured: normalizedFeatured,
    sort: sortOptions.has((rawSort as ProductSortOption) ?? "updated-desc")
      ? ((rawSort as ProductSortOption) ?? "updated-desc")
      : "updated-desc",
  }
}

function buildProductListWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: "insensitive" } },
      { slug: { contains: params.query, mode: "insensitive" } },
      { sku: { contains: params.query, mode: "insensitive" } },
      { source: { is: { producerName: { contains: params.query, mode: "insensitive" } } } },
    ]
  }

  if (params.status !== "all") {
    where.status = params.status
  }

  if (params.category && params.category !== "all") {
    where.categoryId = params.category
  }

  if (params.featured === "featured") {
    where.featured = true
  }

  if (params.featured === "not-featured") {
    where.featured = false
  }

  return where
}

function getProductListOrderBy(sort: ProductSortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "created-desc":
      return [{ createdAt: "desc" }]
    case "created-asc":
      return [{ createdAt: "asc" }]
    case "name-asc":
      return [{ name: "asc" }]
    case "name-desc":
      return [{ name: "desc" }]
    case "price-desc":
      return [{ sellingPrice: "desc" }, { name: "asc" }]
    case "price-asc":
      return [{ sellingPrice: "asc" }, { name: "asc" }]
    case "display-order-asc":
      return [{ displayOrder: "asc" }, { name: "asc" }]
    case "updated-desc":
    default:
      return [{ updatedAt: "desc" }]
  }
}

export async function getProductList(params: ProductListParams): Promise<ProductListResult> {
  try {
    const where = buildProductListWhere(params)
    const skip = (params.page - 1) * PRODUCT_PAGE_SIZE

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: PRODUCT_PAGE_SIZE,
        orderBy: getProductListOrderBy(params.sort),
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          source: {
            select: {
              producerName: true,
              district: true,
              state: true,
            },
          },
          media: {
            // 'featured' sorts before 'gallery' — enum declared in that order
            orderBy: [{ role: "asc" }, { displayOrder: "asc" }],
            take: 1,
            include: { media: { select: { url: true, altText: true } } },
          },
        },
      }),
    ])

    return {
      products: products.map((product) => ({
        ...product,
        images: product.media.map((pm) => ({
          url: pm.media.url,
          altText: pm.media.altText,
          isPrimary: pm.role === "featured",
        })),
      })),
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / PRODUCT_PAGE_SIZE)),
    }
  } catch (error) {
    console.error("Failed to fetch product list from DB, using fallback:", error)
    return {
      products: [],
      totalCount: 0,
      totalPages: 1,
    }
  }
}

export async function getProductFormOptions(currentProductId?: string): Promise<ProductFormOptions> {
  try {
    const [categories, relatedProducts, collections, mediaOptions] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.product.findMany({
        where: currentProductId ? { id: { not: currentProductId } } : undefined,
        orderBy: [{ name: "asc" }],
        select: {
          id: true,
          name: true,
          sku: true,
          status: true,
        },
      }),
      prisma.collection.findMany({
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      getMediaLibraryOptions(),
    ])

    return {
      categories,
      relatedProducts,
      collections,
      mediaOptions,
    }
  } catch (error) {
    console.error("Failed to fetch product form options from DB, using fallback:", error)
    return {
      categories: [],
      relatedProducts: [],
      collections: [],
      mediaOptions: [],
    }
  }
}

export async function getProductById(productId: string): Promise<ProductDetail | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        source: {
          select: {
            village: true,
            district: true,
            state: true,
            producerName: true,
            producerType: true,
            craftMethod: true,
          },
        },
        media: {
          orderBy: [{ role: "asc" }, { displayOrder: "asc" }],
          include: { media: true },
        },
        relatedProducts: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                sku: true,
                status: true,
                slug: true,
              },
            },
          },
        },
        collections: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          include: {
            collection: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return null
    }

    return {
      ...product,
      images: product.media.map((pm) => ({
        id: pm.id,
        mediaId: pm.mediaId,
        url: pm.media.url,
        altText: pm.media.altText,
        caption: pm.media.caption,
        isPrimary: pm.role === "featured",
        displayOrder: pm.displayOrder,
      })),
    }
  } catch (error) {
    console.error(`Failed to fetch product with ID ${productId} from DB, using fallback:`, error)
    return null
  }
}

export function mapProductToFormValues(product: ProductDetail): ProductFormValues {
  const weight = splitWeight(product.weight)

  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    whyWeSelected: product.whyWeSelected,
    regionStory: product.regionStory,
    storage: product.storage,
    shippingNote: product.shippingNote,
    sku: product.sku,
    categoryId: product.categoryId,
    producerName: product.source?.producerName ?? "",
    producerType: product.source?.producerType ?? "",
    village: product.source?.village ?? "",
    district: product.source?.district ?? "",
    state: product.source?.state ?? "",
    craftMethod: product.source?.craftMethod ?? "",
    mrp: String(product.mrp),
    sellingPrice: String(product.sellingPrice),
    costPrice: product.costPrice === null ? "" : String(product.costPrice),
    gstRate: String(product.gstRate),
    stockStatus: getDerivedStockStatus(product.stock),
    status: product.status,
    featured: product.featured,
    weightValue: weight.weightValue,
    unit: weight.unit,
    displayOrder: String(product.displayOrder),
    images: product.images.map((image) => ({
      mediaId: image.mediaId,
      isPrimary: image.isPrimary,
    })),
    relatedProductIds: product.relatedProducts.map((relation) => relation.relatedProduct.id),
    collectionIds: product.collections.map((entry) => entry.collection.id),
  }
}

export function buildProductListQueryString(
  params: Partial<{
    page: number
    query: string
    status: string
    category: string
    featured: string
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

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status)
  }

  if (params.category && params.category !== "all") {
    searchParams.set("category", params.category)
  }

  if (params.featured && params.featured !== "all") {
    searchParams.set("featured", params.featured)
  }

  if (params.sort && params.sort !== "updated-desc") {
    searchParams.set("sort", params.sort)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}
