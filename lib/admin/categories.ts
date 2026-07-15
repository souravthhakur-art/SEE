import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  CATEGORY_PAGE_SIZE,
  type CategoryActiveFilterOption,
  type CategoryFeaturedFilterOption,
  type CategoryFormValues,
  type CategorySortOption,
  type ParentCategoryOption,
} from "@/lib/admin/category-form"

export interface CategoryListParams {
  page: number
  query: string
  featured: CategoryFeaturedFilterOption
  active: CategoryActiveFilterOption
  parent: string
  sort: CategorySortOption
}

export interface CategoryListItem {
  id: string
  name: string
  slug: string
  description: string | null
  featured: boolean
  active: boolean
  displayOrder: number
  updatedAt: Date
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

export interface CategoryListResult {
  categories: CategoryListItem[]
  totalCount: number
  totalPages: number
}

export interface CategoryDetail {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  featured: boolean
  active: boolean
  displayOrder: number
  image: string | null
  seoTitle: string | null
  seoDescription: string | null
  createdAt: Date
  updatedAt: Date
  parent: { id: string; name: string; slug: string } | null
  children: Array<{ id: string; name: string; slug: string; active: boolean }>
  _count: { products: number }
}

export interface CategoryFormOptions {
  parentOptions: ParentCategoryOption[]
}

export function parseCategoryListParams(
  raw: Partial<Record<string, string | string[] | undefined>>
): CategoryListParams {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page
  const rawQuery = Array.isArray(raw.query) ? raw.query[0] : raw.query
  const rawFeatured = Array.isArray(raw.featured) ? raw.featured[0] : raw.featured
  const rawActive = Array.isArray(raw.active) ? raw.active[0] : raw.active
  const rawParent = Array.isArray(raw.parent) ? raw.parent[0] : raw.parent
  const rawSort = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort

  const page = Number.parseInt(rawPage ?? "1", 10)
  const normalizedFeatured = rawFeatured === "featured" || rawFeatured === "not-featured" ? rawFeatured : "all"
  const normalizedActive = rawActive === "active" || rawActive === "inactive" ? rawActive : "all"

  const sortOptions = new Set<CategorySortOption>([
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
    parent: (rawParent ?? "all").trim(),
    sort: sortOptions.has((rawSort as CategorySortOption) ?? "display-order-asc")
      ? ((rawSort as CategorySortOption) ?? "display-order-asc")
      : "display-order-asc",
  }
}

function buildCategoryListWhere(params: CategoryListParams): Prisma.CategoryWhereInput {
  const where: Prisma.CategoryWhereInput = {}

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

  if (params.parent && params.parent !== "all") {
    where.parentId = params.parent === "none" ? null : params.parent
  }

  return where
}

function getCategoryListOrderBy(sort: CategorySortOption): Prisma.CategoryOrderByWithRelationInput[] {
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

export async function getCategoryList(params: CategoryListParams): Promise<CategoryListResult> {
  const where = buildCategoryListWhere(params)
  const skip = (params.page - 1) * CATEGORY_PAGE_SIZE

  const [totalCount, categories] = await prisma.$transaction([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      skip,
      take: CATEGORY_PAGE_SIZE,
      orderBy: getCategoryListOrderBy(params.sort),
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        active: true,
        displayOrder: true,
        updatedAt: true,
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    }),
  ])

  return {
    categories,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / CATEGORY_PAGE_SIZE)),
  }
}

// Walks the category tree to find every descendant of `categoryId`, so a
// category can never be reassigned under its own child (which would create
// a cycle in the parent chain).
async function getDescendantCategoryIds(categoryId: string): Promise<Set<string>> {
  const descendants = new Set<string>()
  let frontier = [categoryId]

  while (frontier.length > 0) {
    const children = await prisma.category.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    })

    frontier = []
    for (const child of children) {
      if (!descendants.has(child.id)) {
        descendants.add(child.id)
        frontier.push(child.id)
      }
    }
  }

  return descendants
}

export async function getCategoryFormOptions(currentCategoryId?: string): Promise<CategoryFormOptions> {
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  })

  if (!currentCategoryId) {
    return { parentOptions: categories }
  }

  const descendantIds = await getDescendantCategoryIds(currentCategoryId)

  return {
    parentOptions: categories.filter((category) => category.id !== currentCategoryId && !descendantIds.has(category.id)),
  }
}

export async function getCategoryById(categoryId: string): Promise<CategoryDetail | null> {
  return prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      featured: true,
      active: true,
      displayOrder: true,
      image: true,
      seoTitle: true,
      seoDescription: true,
      createdAt: true,
      updatedAt: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, active: true },
      },
      _count: { select: { products: true } },
    },
  })
}

export function mapCategoryToFormValues(category: CategoryDetail): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    parentId: category.parentId ?? "",
    featured: category.featured,
    active: category.active,
    displayOrder: String(category.displayOrder),
    image: category.image ?? "",
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
  }
}

export function buildCategoryListQueryString(
  params: Partial<{
    page: number
    query: string
    featured: string
    active: string
    parent: string
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

  if (params.parent && params.parent !== "all") {
    searchParams.set("parent", params.parent)
  }

  if (params.sort && params.sort !== "display-order-asc") {
    searchParams.set("sort", params.sort)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}
