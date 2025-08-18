// components/layout/Sidebar.client.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Flags = {
  isPlatformAdmin: boolean
}

function usePlatformFlags(): Flags {
  const [flags, setFlags] = React.useState<Flags>({ isPlatformAdmin: false })

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // إن وُجد endpoint يعيد صلاحيات المنصّة
        const r = await fetch('/api/session', { cache: 'no-store' })
        if (!r.ok) throw new Error('no session')
        const j = await r.json().catch(() => ({}))
        if (!cancelled) {
          setFlags({ isPlatformAdmin: !!(j.platform_admin || j.platformOwner || j.is_platform_admin) })
        }
      } catch {
        // fallback اختياري: localStorage=1 يعني Admin منصة
        try {
          const v = localStorage.getItem('aoos.platformAdmin')
          if (!cancelled && v === '1') setFlags({ isPlatformAdmin: true })
        } catch {}
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return flags
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active =
    pathname === href || (href !== '/' && pathname?.startsWith(href))

  return (
    <Link
      href={href}
      className={`block rounded px-3 py-2 text-sm hover:bg-neutral-100 ${
        active ? 'bg-neutral-100 font-medium' : 'text-neutral-700'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { isPlatformAdmin } = usePlatformFlags()

  const onClick = () => onNavigate?.()

  return (
    <nav className="rounded border bg-white p-2 shadow-soft">
      <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Navigation
      </div>

      <div onClick={onClick} className="space-y-1">
        <NavLink href="/home">Home</NavLink>
        <NavLink href="/suggestions">Suggestions</NavLink>
        <NavLink href="/pos">Purchase Orders</NavLink>
        <NavLink href="/suppliers">Suppliers</NavLink>
        <NavLink href="/uploads">Uploads</NavLink>
        <NavLink href="/outbox">Outbox</NavLink>
        <NavLink href="/audit">Audit</NavLink>
        <NavLink href="/templates">Templates</NavLink>
        <NavLink href="/settings">Settings</NavLink>

        {/* شرط #5: إخفاء Admin / Platform Inbox / Support ما لم يكن المستخدم Admin منصة */}
        {isPlatformAdmin && (
          <>
            <div className="mt-3 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Platform
            </div>
            <NavLink href="/admin">Admin Dashboard</NavLink>
            <NavLink href="/admin/messages">Platform Inbox</NavLink>
            <NavLink href="/support">Support</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
