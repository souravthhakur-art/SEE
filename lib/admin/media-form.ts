export const MEDIA_PAGE_SIZE = 12

export const MEDIA_SORT_OPTIONS = [
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "usage-desc", label: "Most used" },
  { value: "alt-asc", label: "Alt text A–Z" },
] as const

export type MediaSortOption = (typeof MEDIA_SORT_OPTIONS)[number]["value"]

// Sprint 2.3 is URL-based only (no uploads, no CDN, no processing
// pipeline — see 11-database-spec.md), so there is no upload-state
// status ("processing" / "failed" / etc). "Status" here means whether
// the asset is currently attached to any product, since that's what
// determines whether it can be safely deleted.
export const MEDIA_USAGE_FILTER_OPTIONS = [
  { value: "all", label: "All media" },
  { value: "used", label: "In use" },
  { value: "unused", label: "Unused" },
] as const

export type MediaUsageFilterOption = (typeof MEDIA_USAGE_FILTER_OPTIONS)[number]["value"]

export interface MediaFormValues {
  url: string
  altText: string
  caption: string
}

export interface MediaFormState {
  ok: boolean
  message: string | null
  fieldErrors: Record<string, string>
}

export const INITIAL_MEDIA_FORM_STATE: MediaFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
}

export const EMPTY_MEDIA_FORM_VALUES: MediaFormValues = {
  url: "",
  altText: "",
  caption: "",
}
