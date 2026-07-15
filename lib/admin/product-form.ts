export const PRODUCT_PAGE_SIZE = 10

export const PRODUCT_SORT_OPTIONS = [
  { value: "updated-desc", label: "Recently updated" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-desc", label: "Price high to low" },
  { value: "price-asc", label: "Price low to high" },
  { value: "display-order-asc", label: "Display order" },
] as const

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number]["value"]

export const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const

export type ProductStatusOption = (typeof PRODUCT_STATUS_OPTIONS)[number]["value"]

export const FEATURED_FILTER_OPTIONS = [
  { value: "all", label: "All products" },
  { value: "featured", label: "Featured only" },
  { value: "not-featured", label: "Not featured" },
] as const

export type FeaturedFilterOption = (typeof FEATURED_FILTER_OPTIONS)[number]["value"]

export const STOCK_STATUS_OPTIONS = [
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
] as const

export type StockStatusOption = (typeof STOCK_STATUS_OPTIONS)[number]["value"]

export const PRODUCER_TYPE_OPTIONS = [
  { value: "shg", label: "SHG" },
  { value: "farm", label: "Farm" },
  { value: "cooperative", label: "Cooperative" },
  { value: "estate", label: "Estate" },
] as const

export type ProducerTypeOption = (typeof PRODUCER_TYPE_OPTIONS)[number]["value"]

export interface ProductCategoryOption {
  id: string
  name: string
  slug: string
}

export interface ProductRelationOption {
  id: string
  name: string
  sku: string
  status: ProductStatusOption
}

export interface ProductCollectionOption {
  id: string
  name: string
  slug: string
}

export interface ProductImageValue {
  mediaId: string
  isPrimary: boolean
}

export interface ProductFormValues {
  name: string
  slug: string
  shortDescription: string
  description: string
  whyWeSelected: string
  regionStory: string
  storage: string
  shippingNote: string
  sku: string
  categoryId: string
  producerName: string
  producerType: ProducerTypeOption | ""
  village: string
  district: string
  state: string
  craftMethod: string
  mrp: string
  sellingPrice: string
  costPrice: string
  gstRate: string
  stockStatus: StockStatusOption
  status: ProductStatusOption
  featured: boolean
  weightValue: string
  unit: string
  displayOrder: string
  images: ProductImageValue[]
  relatedProductIds: string[]
  collectionIds: string[]
}

export interface ProductFormState {
  ok: boolean
  message: string | null
  fieldErrors: Record<string, string>
}

export const INITIAL_PRODUCT_FORM_STATE: ProductFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
}

export const EMPTY_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  whyWeSelected: "",
  regionStory: "",
  storage: "",
  shippingNote: "",
  sku: "",
  categoryId: "",
  producerName: "",
  producerType: "",
  village: "",
  district: "",
  state: "",
  craftMethod: "",
  mrp: "",
  sellingPrice: "",
  costPrice: "",
  gstRate: "5",
  stockStatus: "in_stock",
  status: "draft",
  featured: false,
  weightValue: "",
  unit: "g",
  displayOrder: "0",
  images: [],
  relatedProductIds: [],
  collectionIds: [],
}

export function splitWeight(weight: string | null | undefined) {
  if (!weight) {
    return { weightValue: "", unit: "g" }
  }

  const match = weight.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/)

  if (!match) {
    return { weightValue: weight, unit: "" }
  }

  return {
    weightValue: match[1] ?? "",
    unit: match[2] ?? "",
  }
}

export function buildWeight(weightValue: string, unit: string) {
  const normalizedValue = weightValue.trim()
  const normalizedUnit = unit.trim()

  if (!normalizedValue) return ""
  if (!normalizedUnit) return normalizedValue

  const compactUnits = new Set(["g", "kg", "ml", "l"])

  if (compactUnits.has(normalizedUnit.toLowerCase())) {
    return `${normalizedValue}${normalizedUnit}`
  }

  return `${normalizedValue} ${normalizedUnit}`
}

export function formatAdminCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getDerivedStockStatus(stock: number) {
  return stock > 0 ? "in_stock" : "out_of_stock"
}
