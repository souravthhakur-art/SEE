"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormStatus } from "react-dom"

interface MediaDeleteButtonProps {
  mediaLabel: string
  action: () => void | Promise<void>
  cancelHref?: string
  variant?: "inline" | "ghost"
}

function ConfirmDeleteSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-sm border border-red-700 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Deleting…" : "Delete media"}
    </button>
  )
}

export function MediaDeleteButton({
  mediaLabel,
  action,
  cancelHref,
  variant = "inline",
}: MediaDeleteButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "ghost"
            ? "text-sm font-medium text-red-700 transition hover:text-red-800"
            : "inline-flex items-center justify-center rounded-sm border border-red-700 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-700 hover:text-white"
        }
      >
        Delete
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4">
          <div className="w-full max-w-lg rounded-sm border border-wood-light/40 bg-ivory p-6 shadow-[0_20px_60px_-20px_rgba(47,47,47,0.35)]">
            <p className="label text-wood">Delete media</p>
            <h2 className="mt-2 font-heading text-3xl text-charcoal">Confirm permanent deletion</h2>
            <p className="mt-3 text-sm leading-6 text-wood">
              <strong className="text-charcoal">{mediaLabel}</strong> will be permanently removed. If any products
              still reference it, the deletion will be blocked instead.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <form action={action}>
                <ConfirmDeleteSubmitButton />
              </form>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-sm border border-wood-light px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-ivory-dark"
              >
                Keep media
              </button>

              {cancelHref ? (
                <Link href={cancelHref} className="text-sm text-wood transition hover:text-charcoal">
                  Back to media
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
