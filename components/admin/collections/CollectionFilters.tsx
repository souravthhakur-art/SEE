import {
  COLLECTION_ACTIVE_FILTER_OPTIONS,
  COLLECTION_FEATURED_FILTER_OPTIONS,
  COLLECTION_SORT_OPTIONS,
} from "@/lib/admin/collection-form"
import type { CollectionListParams } from "@/lib/admin/collections"

interface CollectionFiltersProps {
  filters: CollectionListParams
}

export function CollectionFilters({ filters }: CollectionFiltersProps) {
  return (
    <form className="rounded-sm border border-wood-light/30 bg-ivory p-5" method="get">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            {COLLECTION_FEATURED_FILTER_OPTIONS.map((option) => (
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
            {COLLECTION_ACTIVE_FILTER_OPTIONS.map((option) => (
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
            {COLLECTION_SORT_OPTIONS.map((option) => (
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
          <a href="/admin/categories/collections" className="text-sm text-wood transition hover:text-charcoal">
            Reset
          </a>
        </div>
      </div>
    </form>
  )
}
