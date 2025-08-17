'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'

type Item = { href: Route; label: string }

const items: readonly Item[] = [
  { href: '/home', label: 'Home' },
  { href: '/suggestions', label: 'Suggestions' },
  { href: '/pos', label: 'Purchase Orders' },
  { href: '/people', label: 'People' },
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/uploads', label: 'Uploads' },
  { href: '/outbox', label: 'Outbox' },
  { href: '/templates', label: 'Templates' },
  { href: '/audit', label: 'Audit' },
  { href: '/settings', label: 'Settings' },
  { href: '/support', label: 'Support' },
  { href: '/admin', label: 'Admin' },
  { href: '/admin/messages', label: 'Platform Inbox' },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <nav className="rounded border p-2 shadow-soft">
      <ul className="space-y-1">
        {items.map((i) => {
          const active = pathname === i.href || pathname?.startsWith(`${i.href}/`)
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`block rounded px-3 py-2 text-sm hover:bg-neutral-50 ${
                  active ? 'bg-brand/10 text-brand-800 font-medium' : ''
                }`}
              >
                {i.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
