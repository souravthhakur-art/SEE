import { MEDIA_SORT_OPTIONS, MEDIA_USAGE_FILTER_OPTIONS } from "@/lib/admin/media-form"
import type { MediaListParams } from "@/lib/admin/media"

interface MediaFiltersProps {
  filters: MediaListParams
}

export function MediaFilters({ filters }: MediaFiltersProps) {
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
            placeholder="Alt text, URL, caption"
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          />
        </div>

        <div>
          <label htmlFor="usage" className="label text-wood">
            Usage
          </label>
          <select
            id="usage"
            name="usage"
            defaultValue={filters.usage}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            {MEDIA_USAGE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="label text-wood">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
          >
            {MEDIA_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-wood-light/20 pt-4">
        <button type="submit" className="btn-primary px-6 py-3 text-xs">
          Apply filters
        </button>
        <a href="/admin/media" className="text-sm text-wood transition hover:text-charcoal">
          Reset
        </a>
      </div>
    </form>
  )
}
