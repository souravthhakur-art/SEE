export const COLLECTION_PAGE_SIZE = 10

export const COLLECTION_SORT_OPTIONS = [
  { value: "display-order-asc", label: "Display order" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "product-count-desc", label: "Most products" },
] as const

export type CollectionSortOption = (typeof COLLECTION_SORT_OPTIONS)[number]["value"]

export const COLLECTION_FEATURED_FILTER_OPTIONS = [
  { value: "all", label: "All collections" },
  { value: "featured", label: "Featured only" },
  { value: "not-featured", label: "Not featured" },
] as const

export type CollectionFeaturedFilterOption = (typeof COLLECTION_FEATURED_FILTER_OPTIONS)[number]["value"]

export const COLLECTION_ACTIVE_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
] as const

export type CollectionActiveFilterOption = (typeof COLLECTION_ACTIVE_FILTER_OPTIONS)[number]["value"]

export interface CollectionProductOption {
  id: string
  name: string
  sku: string
  status: "active" | "draft" | "archived"
}

export interface CollectionFormValues {
  name: string
  slug: string
  description: string
  featured: boolean
  active: boolean
  displayOrder: string
  image: string
  productIds: string[]
}

export interface CollectionFormState {
  ok: boolean
  message: string | null
  fieldErrors: Record<string, string>
}

export const INITIAL_COLLECTION_FORM_STATE: CollectionFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
}

export const EMPTY_COLLECTION_FORM_VALUES: CollectionFormValues = {
  name: "",
  slug: "",
  description: "",
  featured: false,
  active: true,
  displayOrder: "0",
  image: "",
  productIds: [],
}
