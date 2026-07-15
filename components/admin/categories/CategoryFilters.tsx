import {
  CATEGORY_ACTIVE_FILTER_OPTIONS,
  CATEGORY_FEATURED_FILTER_OPTIONS,
  CATEGORY_SORT_OPTIONS,
  type ParentCategoryOption,
} from "@/lib/admin/category-form"
import type { CategoryListParams } from "@/lib/admin/categories"

interface CategoryFiltersProps {
  filters: CategoryListParams
  parentOptions: ParentCategoryOption[]
}

export function CategoryFilters({ filters, parentOptions }: CategoryFiltersProps) {
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
            placeholder="Name, slug, description"
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          />
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
            {CATEGORY_FEATURED_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="active" className="label text-wood">
            Status
          </label>
          <select
            id="active"
            name="active"
            defaultValue={filters.active}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            {CATEGORY_ACTIVE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="parent" className="label text-wood">
            Parent category
          </label>
          <select
            id="parent"
            name="parent"
            defaultValue={filters.parent}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            <option value="all">All categories</option>
            <option value="none">Top-level only</option>
            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
            {CATEGORY_SORT_OPTIONS.map((option) => (
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
          <a href="/admin/categories" className="text-sm text-wood transition hover:text-charcoal">
            Reset
          </a>
        </div>
      </div>
    </form>
  )
}
