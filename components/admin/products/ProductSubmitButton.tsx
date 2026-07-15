"use client"

import { useFormStatus } from "react-dom"

interface ProductSubmitButtonProps {
  idleLabel: string
  pendingLabel: string
}

export function ProductSubmitButton({ idleLabel, pendingLabel }: ProductSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
