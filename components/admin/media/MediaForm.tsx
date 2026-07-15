"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import {
  EMPTY_MEDIA_FORM_VALUES,
  INITIAL_MEDIA_FORM_STATE,
  type MediaFormState,
  type MediaFormValues,
} from "@/lib/admin/media-form"
import { ProductSubmitButton } from "@/components/admin/products/ProductSubmitButton"

interface MediaFormProps {
  mode: "create" | "edit"
  action: (state: MediaFormState, formData: FormData) => Promise<MediaFormState>
  initialValues?: MediaFormValues
  cancelHref: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-1 text-sm text-red-700">{message}</p>
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="label text-wood">
      {children}
    </label>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-wood-light/30 bg-ivory p-6">
      <div className="mb-5">
        <p className="label text-wood">{title}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-wood">{description}</p>
      </div>
      {children}
    </section>
  )
}

export function MediaForm({
  mode,
  action,
  initialValues = EMPTY_MEDIA_FORM_VALUES,
  cancelHref,
}: MediaFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_MEDIA_FORM_STATE)
  const [urlValue, setUrlValue] = useState(initialValues.url)

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className={`rounded-sm border px-4 py-3 text-sm ${state.ok ? "border-forest/25 bg-forest/10 text-forest" : "border-red-700/25 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      ) : null}

      <Section
        title="Media asset details"
        description="URL-based media only for this release — no uploads or CDN processing. Paste a hosted image URL and give it descriptive alt text."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel htmlFor="url">Image URL</FieldLabel>
            <input
              id="url"
              name="url"
              defaultValue={initialValues.url}
              onChange={(event) => setUrlValue(event.target.value)}
              placeholder="https://…"
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.url} />

            {urlValue ? (
              <div className="mt-3 flex h-40 w-40 items-center justify-center overflow-hidden rounded-sm border border-wood-light/30 bg-ivory-dark">
                <img
                  src={urlValue}
                  alt="Live preview"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none"
                  }}
                />
              </div>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="altText">Alt text</FieldLabel>
            <input
              id="altText"
              name="altText"
              defaultValue={initialValues.altText}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.altText} />
          </div>

          <div>
            <FieldLabel htmlFor="caption">Caption (optional)</FieldLabel>
            <input
              id="caption"
              name="caption"
              defaultValue={initialValues.caption}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.caption} />
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3 border-t border-wood-light/20 pt-2">
        <ProductSubmitButton
          idleLabel={mode === "create" ? "Create media" : "Save changes"}
          pendingLabel={mode === "create" ? "Creating media…" : "Saving changes…"}
        />
        <Link href={cancelHref} className="inline-flex items-center justify-center rounded-sm border border-wood-light px-4 py-3 text-sm font-medium text-charcoal transition hover:bg-ivory-dark">
          Cancel
        </Link>
      </div>
    </form>
  )
}
