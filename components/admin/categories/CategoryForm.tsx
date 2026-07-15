"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import {
  EMPTY_CATEGORY_FORM_VALUES,
  INITIAL_CATEGORY_FORM_STATE,
  type CategoryFormState,
  type CategoryFormValues,
  type ParentCategoryOption,
} from "@/lib/admin/category-form"
import { ProductSubmitButton } from "@/components/admin/products/ProductSubmitButton"

interface CategoryFormProps {
  mode: "create" | "edit"
  action: (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>
  parentOptions: ParentCategoryOption[]
  initialValues?: CategoryFormValues
  cancelHref: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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

export function CategoryForm({
  mode,
  action,
  parentOptions,
  initialValues = EMPTY_CATEGORY_FORM_VALUES,
  cancelHref,
}: CategoryFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_CATEGORY_FORM_STATE)
  const [slugValue, setSlugValue] = useState(initialValues.slug)

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className={`rounded-sm border px-4 py-3 text-sm ${state.ok ? "border-forest/25 bg-forest/10 text-forest" : "border-red-700/25 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      ) : null}

      <Section
        title="Core category details"
        description="These fields identify the category across the admin and (once wired) the storefront navigation."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <input
              id="name"
              name="name"
              defaultValue={initialValues.name}
              onChange={(event) => {
                if (!slugValue || slugValue === slugify(initialValues.name)) {
                  setSlugValue(slugify(event.target.value))
                }
              }}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.name} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <button
                type="button"
                onClick={() => setSlugValue(slugify((document.getElementById("name") as HTMLInputElement | null)?.value ?? ""))}
                className="text-xs font-medium uppercase tracking-[0.14em] text-wood transition hover:text-charcoal"
              >
                Generate from name
              </button>
            </div>
            <input
              id="slug"
              name="slug"
              value={slugValue}
              onChange={(event) => setSlugValue(event.target.value)}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.slug} />
          </div>

          <div>
            <FieldLabel htmlFor="parentId">Parent category</FieldLabel>
            <select
              id="parentId"
              name="parentId"
              defaultValue={initialValues.parentId}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            >
              <option value="">No parent (top-level)</option>
              {parentOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.parentId} />
          </div>

          <div>
            <FieldLabel htmlFor="displayOrder">Display order</FieldLabel>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min="0"
              defaultValue={initialValues.displayOrder}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.displayOrder} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              name="description"
              defaultValue={initialValues.description}
              rows={4}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.description} />
          </div>

          <div>
            <FieldLabel htmlFor="image">Category image URL</FieldLabel>
            <input
              id="image"
              name="image"
              defaultValue={initialValues.image}
              placeholder="https://…"
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.image} />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-7">
            <label className="flex items-center gap-3">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                defaultChecked={initialValues.featured}
                className="h-4 w-4 rounded border-wood-light text-forest"
              />
              <span className="text-sm font-medium text-charcoal">Featured category</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked={initialValues.active}
                className="h-4 w-4 rounded border-wood-light text-forest"
              />
              <span className="text-sm font-medium text-charcoal">Active</span>
            </label>
          </div>
        </div>
      </Section>

      <Section
        title="SEO"
        description="Optional metadata for search engines. Leave blank to fall back to the category name and description."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
            <input
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialValues.seoTitle}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.seoTitle} />
          </div>

          <div>
            <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
            <input
              id="seoDescription"
              name="seoDescription"
              defaultValue={initialValues.seoDescription}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.seoDescription} />
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3 border-t border-wood-light/20 pt-2">
        <ProductSubmitButton
          idleLabel={mode === "create" ? "Create category" : "Save changes"}
          pendingLabel={mode === "create" ? "Creating category…" : "Saving changes…"}
        />
        <Link href={cancelHref} className="inline-flex items-center justify-center rounded-sm border border-wood-light px-4 py-3 text-sm font-medium text-charcoal transition hover:bg-ivory-dark">
          Cancel
        </Link>
      </div>
    </form>
  )
}
