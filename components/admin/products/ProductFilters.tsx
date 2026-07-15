import { FEATURED_FILTER_OPTIONS, PRODUCT_SORT_OPTIONS, PRODUCT_STATUS_OPTIONS, type ProductCategoryOption } from "@/lib/admin/product-form"
import type { ProductListParams } from "@/lib/admin/products"

interface ProductFiltersProps {
  filters: ProductListParams
  categories: ProductCategoryOption[]
}

export function ProductFilters({ filters, categories }: ProductFiltersProps) {
  return (
    <form className="rounded-sm border border-wood-light/30 bg-ivory p-5" method="get">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <label htmlFor="query" className="label text-wood">
            Search
          </label>
          <input
            id="query"
            name="query"
            defaultValue={filters.query}
            placeholder="Name, slug, SKU, producer"
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          />
        </div>

        <div>
          <label htmlFor="status" className="label text-wood">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            <option value="all">All statuses</option>
            {PRODUCT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="label text-wood">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="featured" className="label text-wood">
            Featured
          </label>
          <select
            id="featured"
            name="featured"
            defaultValue={filters.featured}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            {FEATURED_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-wood-light/20 pt-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xs">
          <label htmlFor="sort" className="label text-wood">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary px-6 py-3 text-xs">
            Apply filters
          </button>
          <a href="/admin/products" className="text-sm text-wood transition hover:text-charcoal">
            Reset
          </a>
        </div>
      </div>
    </form>
  )
}
