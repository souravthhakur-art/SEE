export const CATEGORY_PAGE_SIZE = 10

export const CATEGORY_SORT_OPTIONS = [
  { value: "display-order-asc", label: "Display order" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "product-count-desc", label: "Most products" },
] as const

export type CategorySortOption = (typeof CATEGORY_SORT_OPTIONS)[number]["value"]

export const CATEGORY_FEATURED_FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "featured", label: "Featured only" },
  { value: "not-featured", label: "Not featured" },
] as const

export type CategoryFeaturedFilterOption = (typeof CATEGORY_FEATURED_FILTER_OPTIONS)[number]["value"]

export const CATEGORY_ACTIVE_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
] as const

export type CategoryActiveFilterOption = (typeof CATEGORY_ACTIVE_FILTER_OPTIONS)[number]["value"]

export interface ParentCategoryOption {
  id: string
  name: string
  slug: string
}

export interface CategoryFormValues {
  name: string
  slug: string
  description: string
  parentId: string
  featured: boolean
  active: boolean
  displayOrder: string
  image: string
  seoTitle: string
  seoDescription: string
}

export interface CategoryFormState {
  ok: boolean
  message: string | null
  fieldErrors: Record<string, string>
}

export const INITIAL_CATEGORY_FORM_STATE: CategoryFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
}

export const EMPTY_CATEGORY_FORM_VALUES: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  featured: false,
  active: true,
  displayOrder: "0",
  image: "",
  seoTitle: "",
  seoDescription: "",
}
