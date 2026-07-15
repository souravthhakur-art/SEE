import Link from "next/link"

interface CategoryCollectionTabsProps {
  active: "categories" | "collections"
}

export function CategoryCollectionTabs({ active }: CategoryCollectionTabsProps) {
  const tabs = [
    { key: "categories" as const, label: "Categories", href: "/admin/categories" },
    { key: "collections" as const, label: "Collections", href: "/admin/categories/collections" },
  ]

  return (
    <div className="flex items-center gap-1 border-b border-wood-light/20">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            active === tab.key
              ? "border-b-2 border-forest text-charcoal"
              : "border-b-2 border-transparent text-wood hover:text-charcoal"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
