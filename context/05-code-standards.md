# Code Standards

**Status:** Frozen (Documentation v1.0)
**Version:** 1.0
**Owner:** Palum Dhara Engineering
**Depends on:** `CLAUDE.md`, `03-ui-design-system.md`, `04-architecture.md`

**Purpose** — How we write code at Palum Dhara. Based on Ponytail philosophy: minimal, purposeful, direct.

**Scope** — Naming, components, TypeScript, Tailwind, composition, performance, accessibility, imports, folders, refactoring, anti-patterns.

**Contents** — Rules and conventions for writing code in this project.

**Update Rules** — Update when a new convention is established or an existing one is changed. Do not add rules we don't actually follow.

---

## Ponytail Philosophy

See `CLAUDE.md` for the authoritative statement of Ponytail Principles.

In code, this means:

- If a component is used once, don't extract it
- If a function is used once, don't abstract it
- If a pattern appears three times, it must be extracted
- Delete dead code immediately. Don't comment it out.
- Every `import` is a dependency. Justify each one.
- Never optimise for AI. Always optimise for the next human developer.

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx` |
| Files (components) | PascalCase | `ProductCard.tsx` |
| Files (non-components) | kebab-case | `format-price.ts` |
| Functions | camelCase | `formatPrice()` |
| Constants | SCREAMING_SNAKE | `MAX_IMAGE_SIZE` |
| Types/Interfaces | PascalCase | `Product`, `SubscriptionTier` |
| Boolean props | `is`/`has` prefix | `isLoading`, `hasError` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleClick` |
| CSS classes | Tailwind only | No custom class names |
| Store files | kebab-case | `cart-store.ts`, `auth-store.ts` |

## Component Rules

- One component per file
- File name = component name
- Props defined as a typed interface, named `{ComponentName}Props`
- Destructure props in the function signature
- No default exports — use named exports
- Keep components under 150 lines. If longer, split.
- No `React.FC` — use plain function return type
- Children via `props.children`, not a wrapper `children` type hack

```typescript
// Do
interface ProductCardProps {
  name: string
  price: number
  image: string
}

export function ProductCard({ name, price, image }: ProductCardProps) {
  return (...)
}

// Don't
export default function ProductCard(props: any) {
  return (...)
}
```

## TypeScript Rules

- Strict mode enabled — no `any`, no implicit `any`
- Define types in the same file if used only there. In `data/` or `lib/types.ts` if shared.
- Prefer `interface` for object shapes, `type` for unions and intersections
- No `enum` — use string literal unions
- No type assertions (`as`) unless unavoidable, and always with a comment explaining why

## Tailwind Rules

- Use Tailwind utility classes only. No custom CSS unless absolutely necessary.
- Order: layout → spacing → sizing → typography → color → misc
- Use the design system tokens from `03-ui-design-system.md` — don't invent new values
- Responsive: mobile-first, use `md:` and `lg:` prefixes
- Don't use arbitrary values (`[24px]`) when a standard value exists
- Don't use `!important`
- Extract repeated patterns into a component, not a `@apply` class

## Composition Over Duplication

- If two components share UI, extract a shared component
- If two components share logic, extract a custom hook
- If a pattern appears three times, it must be extracted
- Never copy-paste a component to modify it — compose or extend

## Performance Rules

- Server Components by default
- Only add `"use client"` when the component needs interactivity, browser APIs, or React hooks
- No unnecessary `useEffect` — prefer derived state or server-side computation
- No inline object/array creation in JSX (extract to variables or `useMemo` if referenced in deps)
- Memoize expensive computations, not every render
- Images: always `next/image`, always sized

## Accessibility Rules

- Semantic HTML first (`button`, `nav`, `main`, `article`, etc.)
- `alt` text on every image — descriptive, not "image of..."
- `aria-label` on icon-only buttons
- `aria-expanded` on toggleable elements (mobile menu, accordions)
- Focus management: return focus after modal close
- `role` attributes only when semantic HTML doesn't cover the case
- No `tabIndex` greater than 0

## Import Ordering

```typescript
// 1. React / Next.js
import { useState } from 'react'
import Image from 'next/image'

// 2. Internal state (Zustand stores, currently kept in lib/)
import { useCartStore } from '@/lib/cart-store'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'

// 4. Internal utilities
import { formatPrice } from '@/lib/format-price'

// 5. Types
import type { Product } from '@/data/types'

// 6. Styles (rare — Tailwind preferred)
```

- Use `@/` path alias for all internal imports
- No circular imports
- No unused imports

## Folder Conventions

- `components/ui/` — Primitive, reusable, no business logic
- `components/layout/` — Page structure (nav, footer, container)
- `components/sections/` — Page-level sections that compose UI components
- `lib/` — Pure functions, utilities, configurations, and shared client-state stores (e.g. `cart-store.ts`). No separate `stores/` folder exists — if a second global store is added, that's the trigger to introduce one and move both in together.
- `data/` — Static data, TypeScript types, constants
- `app/` — Only page files and layouts. No components in `app/`.

## Refactoring Rules

- Refactor only when changing the code for another reason (feature, bug fix)
- Don't refactor without understanding the full context
- One refactoring concern per PR — don't mix restructure with feature work
- If you rename or move a file, update all imports in the same PR
- Delete dead code immediately. Don't comment it out. Don't "keep it for now."

## Things We Avoid

| Avoid | Why |
|---|---|
| `any` type | Defeats TypeScript. Use `unknown` if truly dynamic. |
| `// @ts-ignore` | Hides real problems. Fix the type. |
| Default exports | Make refactoring harder. Use named exports. |
| `React.FC` | Unnecessary wrapper. Use plain functions. |
| `useEffect` for data fetching | Use Server Components. |
| Inline styles | Use Tailwind. |
| `!important` in CSS | Fix the specificity problem. |
| Deeply nested ternaries | Use early returns or extract to variables. |
| Boolean prop without `is`/`has` prefix | `disabled` is the only exception. |
| Comments that restate code | `// set loading to true` before `setLoading(true)` is noise. |
| More than 2 levels of nesting in JSX | Extract sub-components. |
| New libraries | Every library is a dependency forever. Justify it. |
| Global state for local concerns | If one component owns it, keep it local. |
