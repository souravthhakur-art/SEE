"use client"

import { useActionState, useMemo, useState } from "react"
import Link from "next/link"
import {
  EMPTY_PRODUCT_FORM_VALUES,
  INITIAL_PRODUCT_FORM_STATE,
  PRODUCER_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  STOCK_STATUS_OPTIONS,
  type ProductCategoryOption,
  type ProductCollectionOption,
  type ProductFormState,
  type ProductFormValues,
  type ProductImageValue,
  type ProductRelationOption,
} from "@/lib/admin/product-form"
import type { ProductMediaOption } from "@/lib/admin/media"
import { ProductSubmitButton } from "@/components/admin/products/ProductSubmitButton"

interface ProductFormProps {
  mode: "create" | "edit"
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>
  categories: ProductCategoryOption[]
  relatedProducts: ProductRelationOption[]
  collections: ProductCollectionOption[]
  mediaOptions: ProductMediaOption[]
  initialValues?: ProductFormValues
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

export function ProductForm({
  mode,
  action,
  categories,
  relatedProducts,
  collections,
  mediaOptions,
  initialValues = EMPTY_PRODUCT_FORM_VALUES,
  cancelHref,
}: ProductFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_PRODUCT_FORM_STATE)
  const [slugValue, setSlugValue] = useState(initialValues.slug)
  const [images, setImages] = useState<ProductImageValue[]>(initialValues.images)
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initialValues.relatedProductIds)
  const [collectionIds, setCollectionIds] = useState<string[]>(initialValues.collectionIds)

  const selectedRelatedProducts = useMemo(() => new Set(relatedProductIds), [relatedProductIds])
  const selectedCollections = useMemo(() => new Set(collectionIds), [collectionIds])

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="relatedProductIds" value={JSON.stringify(relatedProductIds)} />
      <input type="hidden" name="collectionIds" value={JSON.stringify(collectionIds)} />

      {state.message ? (
        <div className={`rounded-sm border px-4 py-3 text-sm ${state.ok ? "border-forest/25 bg-forest/10 text-forest" : "border-red-700/25 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      ) : null}

      <Section
        title="Core product details"
        description="Use the existing admin design language. This section covers the required commercial identity fields for the product card, SKU, publishing, and storefront-facing descriptions."
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
            <FieldLabel htmlFor="sku">SKU</FieldLabel>
            <input
              id="sku"
              name="sku"
              defaultValue={initialValues.sku}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.sku} />
          </div>

          <div>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={initialValues.categoryId}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.categoryId} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="shortDescription">Short description</FieldLabel>
            <textarea
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialValues.shortDescription}
              rows={3}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.shortDescription} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              name="description"
              defaultValue={initialValues.description}
              rows={6}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.description} />
          </div>
        </div>
      </Section>

      <Section
        title="Brand content"
        description="These fields already exist in the Prisma Product model. Keeping them editable here avoids schema churn and lets the admin write complete product records without touching the storefront integration."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel htmlFor="whyWeSelected">Why we selected it</FieldLabel>
            <textarea
              id="whyWeSelected"
              name="whyWeSelected"
              defaultValue={initialValues.whyWeSelected}
              rows={4}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.whyWeSelected} />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="regionStory">Region story</FieldLabel>
            <textarea
              id="regionStory"
              name="regionStory"
              defaultValue={initialValues.regionStory}
              rows={4}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.regionStory} />
          </div>

          <div>
            <FieldLabel htmlFor="storage">Storage instructions</FieldLabel>
            <textarea
              id="storage"
              name="storage"
              defaultValue={initialValues.storage}
              rows={4}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.storage} />
          </div>

          <div>
            <FieldLabel htmlFor="shippingNote">Shipping note</FieldLabel>
            <textarea
              id="shippingNote"
              name="shippingNote"
              defaultValue={initialValues.shippingNote}
              rows={4}
              className="mt-2 w-full rounded-sm border border-wood-light/50 bg-white px-3 py-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.shippingNote} />
          </div>
        </div>
      </Section>

      <Section
        title="Producer and product source"
        description="This maps directly to the existing ProductSource relation without changing the Prisma schema. Leave the section blank only if source details are genuinely unavailable."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="producerName">Producer name</FieldLabel>
            <input
              id="producerName"
              name="producerName"
              defaultValue={initialValues.producerName}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.producerName} />
          </div>

          <div>
            <FieldLabel htmlFor="producerType">Producer type</FieldLabel>
            <select
              id="producerType"
              name="producerType"
              defaultValue={initialValues.producerType}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            >
              <option value="">Select producer type</option>
              {PRODUCER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.producerType} />
          </div>

          <div>
            <FieldLabel htmlFor="village">Village</FieldLabel>
            <input
              id="village"
              name="village"
              defaultValue={initialValues.village}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.village} />
          </div>

          <div>
            <FieldLabel htmlFor="district">District</FieldLabel>
            <input
              id="district"
              name="district"
              defaultValue={initialValues.district}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.district} />
          </div>

          <div>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <input
              id="state"
              name="state"
              defaultValue={initialValues.state}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.state} />
          </div>

          <div>
            <FieldLabel htmlFor="craftMethod">Craft method</FieldLabel>
            <input
              id="craftMethod"
              name="craftMethod"
              defaultValue={initialValues.craftMethod}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.craftMethod} />
          </div>
        </div>
      </Section>

      <Section
        title="Pricing and publishing"
        description="This sprint keeps storefront data untouched, but the admin can now manage the database-backed product pricing, featured state, stock state, and display order in one place."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <FieldLabel htmlFor="mrp">MRP</FieldLabel>
            <input
              id="mrp"
              name="mrp"
              type="number"
              min="0"
              defaultValue={initialValues.mrp}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.mrp} />
          </div>

          <div>
            <FieldLabel htmlFor="sellingPrice">Selling price</FieldLabel>
            <input
              id="sellingPrice"
              name="sellingPrice"
              type="number"
              min="0"
              defaultValue={initialValues.sellingPrice}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.sellingPrice} />
          </div>

          <div>
            <FieldLabel htmlFor="costPrice">Cost price</FieldLabel>
            <input
              id="costPrice"
              name="costPrice"
              type="number"
              min="0"
              defaultValue={initialValues.costPrice}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.costPrice} />
          </div>

          <div>
            <FieldLabel htmlFor="gstRate">GST %</FieldLabel>
            <input
              id="gstRate"
              name="gstRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues.gstRate}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.gstRate} />
          </div>

          <div>
            <FieldLabel htmlFor="weightValue">Weight</FieldLabel>
            <input
              id="weightValue"
              name="weightValue"
              defaultValue={initialValues.weightValue}
              placeholder="100"
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.weightValue} />
          </div>

          <div>
            <FieldLabel htmlFor="unit">Unit</FieldLabel>
            <input
              id="unit"
              name="unit"
              defaultValue={initialValues.unit}
              placeholder="g / kg / ml / bottle"
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            />
            <FieldError message={state.fieldErrors.unit} />
          </div>

          <div>
            <FieldLabel htmlFor="stockStatus">Stock status</FieldLabel>
            <select
              id="stockStatus"
              name="stockStatus"
              defaultValue={initialValues.stockStatus}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            >
              {STOCK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.stockStatus} />
          </div>

          <div>
            <FieldLabel htmlFor="status">Product status</FieldLabel>
            <select
              id="status"
              name="status"
              defaultValue={initialValues.status}
              className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
            >
              {PRODUCT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors.status} />
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

          <div className="flex items-center gap-3 pt-7">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={initialValues.featured}
              className="h-4 w-4 rounded border-wood-light text-forest"
            />
            <label htmlFor="featured" className="text-sm font-medium text-charcoal">
              Featured product
            </label>
          </div>
        </div>
      </Section>

      <Section
        title="Images"
        description="Pick assets from the central Media Library. Reordering is controlled by the list order below, and the first primary image becomes the lead image in admin views."
      >
        <div className="space-y-4">
          <Link href="/admin/media" className="inline-block text-sm font-medium text-forest transition hover:text-forest-light">
            Manage Media Library →
          </Link>

          {images.length === 0 ? (
            <div className="rounded-sm border border-dashed border-wood-light/40 px-4 py-6 text-sm text-wood">
              No images added yet.
            </div>
          ) : null}

          {images.map((image, index) => {
            const selectedMedia = mediaOptions.find((option) => option.id === image.mediaId)

            return (
              <div key={`${image.mediaId || "new"}-${index}`} className="rounded-sm border border-wood-light/30 bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  {selectedMedia ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.altText}
                      className="h-20 w-20 flex-none rounded-sm border border-wood-light/20 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 flex-none items-center justify-center rounded-sm border border-dashed border-wood-light/40 text-xs text-wood-light">
                      No asset
                    </div>
                  )}

                  <div className="flex-1">
                    <FieldLabel htmlFor={`image-media-${index}`}>Media asset</FieldLabel>
                    <select
                      id={`image-media-${index}`}
                      value={image.mediaId}
                      onChange={(event) => {
                        setImages((current) =>
                          current.map((item, itemIndex) => (itemIndex === index ? { ...item, mediaId: event.target.value } : item))
                        )
                      }}
                      className="mt-2 h-11 w-full rounded-sm border border-wood-light/50 bg-white px-3 text-sm text-charcoal"
                    >
                      <option value="">Select an asset…</option>
                      {mediaOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.altText} — {option.url}
                        </option>
                      ))}
                    </select>
                    <FieldError message={state.fieldErrors[`images.${index}.mediaId`]} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImages((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })))
                    }}
                    className={`rounded-sm border px-3 py-2 text-sm font-medium ${image.isPrimary ? "border-forest bg-forest text-ivory" : "border-wood-light/50 text-charcoal hover:bg-ivory-dark"}`}
                  >
                    {image.isPrimary ? "Primary image" : "Make primary"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (index === 0) return
                      setImages((current) => {
                        const next = [...current]
                        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                        return next
                      })
                    }}
                    className="rounded-sm border border-wood-light/50 px-3 py-2 text-sm font-medium text-charcoal hover:bg-ivory-dark"
                  >
                    Move up
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (index === images.length - 1) return
                      setImages((current) => {
                        const next = [...current]
                        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
                        return next
                      })
                    }}
                    className="rounded-sm border border-wood-light/50 px-3 py-2 text-sm font-medium text-charcoal hover:bg-ivory-dark"
                  >
                    Move down
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }}
                    className="text-sm font-medium text-red-700 transition hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setImages((current) => [...current, { mediaId: mediaOptions[0]?.id ?? "", isPrimary: current.length === 0 }])}
            className="inline-flex items-center justify-center rounded-sm border border-wood-light px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-ivory-dark"
          >
            Add image
          </button>
        </div>
      </Section>

      <Section
        title="Related products"
        description="Select the products that should appear as related items. This only updates the admin-side product relationship data and does not change the storefront wiring yet."
      >
        {relatedProducts.length === 0 ? (
          <div className="rounded-sm border border-dashed border-wood-light/40 px-4 py-6 text-sm text-wood">
            No other products are available to relate yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((product) => {
              const checked = selectedRelatedProducts.has(product.id)

              return (
                <label key={product.id} className="flex items-start gap-3 rounded-sm border border-wood-light/30 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      setRelatedProductIds((current) => {
                        if (event.target.checked) {
                          return [...current, product.id]
                        }
                        return current.filter((id) => id !== product.id)
                      })
                    }}
                    className="mt-1 h-4 w-4 rounded border-wood-light text-forest"
                  />
                  <span>
                    <span className="block text-sm font-medium text-charcoal">{product.name}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-wood">
                      {product.sku} · {product.status}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </Section>

      <Section
        title="Collections"
        description="Assign this product to merchandising collections. Collections are separate from the category tree (DEC-008) and only control curated groupings, not catalog navigation."
      >
        {collections.length === 0 ? (
          <div className="rounded-sm border border-dashed border-wood-light/40 px-4 py-6 text-sm text-wood">
            No collections exist yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const checked = selectedCollections.has(collection.id)

              return (
                <label key={collection.id} className="flex items-start gap-3 rounded-sm border border-wood-light/30 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      setCollectionIds((current) => {
                        if (event.target.checked) {
                          return [...current, collection.id]
                        }
                        return current.filter((id) => id !== collection.id)
                      })
                    }}
                    className="mt-1 h-4 w-4 rounded border-wood-light text-forest"
                  />
                  <span>
                    <span className="block text-sm font-medium text-charcoal">{collection.name}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-wood">{collection.slug}</span>
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </Section>

      <div className="flex flex-wrap items-center gap-3 border-t border-wood-light/20 pt-2">
        <ProductSubmitButton
          idleLabel={mode === "create" ? "Create product" : "Save changes"}
          pendingLabel={mode === "create" ? "Creating product…" : "Saving changes…"}
        />
        <Link href={cancelHref} className="inline-flex items-center justify-center rounded-sm border border-wood-light px-4 py-3 text-sm font-medium text-charcoal transition hover:bg-ivory-dark">
          Cancel
        </Link>
      </div>
    </form>
  )
}
