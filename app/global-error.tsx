"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global boundary caught error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-ivory text-charcoal font-body p-6">
        <div className="max-w-md text-center space-y-6">
          <h2 className="font-heading text-3xl text-forest">Something went wrong</h2>
          <p className="text-sm text-wood">
            The application encountered a global error. Please try refreshing or clearing cache.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="btn-primary px-6 py-2.5 text-xs"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-sm border border-wood-light/50 px-6 py-2.5 text-xs font-medium text-charcoal hover:bg-ivory-dark transition"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
