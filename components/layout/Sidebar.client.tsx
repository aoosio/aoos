// components/layout/Sidebar.client.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Flags = { isPlatformAdmin: boolean }

/** Try a few common session endpoints; tolerate 401/404; never throw. */
async function resolvePlatformFlags(): Promise<Flags> {
  const candidates = ['/api/session', '/api/me', '/api/auth/session']
  for (const url of candidates) {
    try {
      const r = await fetch(url, { cache: 'no-store', credentials: 'include' })
      if (!r.ok) continue
      const j: any = await r.json().catch(() => ({}))
      const isPlatformAdmin = Boolean(
        j.platform_admin ??
          j.platformOwner ??
          j.is_platform_admin ??
          (Array.isArray(j.roles) && j.roles.includes('PLATFORM_ADMIN')) ??
          (j.user && Array.isArray(j.user.roles) && j.user.roles.includes('PLATFORM_ADMIN'))
      )
      return { isPlatformAdmin }
    } catch {
      // ignore and try next
    }
  }
  // Optional localStorage escape hatch for testing
  try {
    if (localStorage.getItem('aoos.platformAdmin') === '1') return { isPlatformAdmin: true }
  } catch {}
  return { isPlatformAdmin: false }
}

function usePlatformFlags(): Flags {
  const [flags, setFlags] = React.useState<Flags>({ isPlatformAdmin: false })
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const f = await resolvePlatformFlags()
      if (!cancelled) setFlags(f)
    })()
    return () => {
      cancelled = true
    }
  }, [])
  return flags
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname?.startsWith(href))
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? 'page' : undefined}
      className={`block rounded px-3 py-2 text-sm hover:bg-neutral-100 ${
        active ? 'bg-neutral-100 font-medium' : 'text-neutral-700'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isPlatformAdmin } = usePlatformFlags()
  const handleClick = () => onNavigate?.()

  return (
    <nav className="rounded border bg-white p-2 shadow-soft">
      <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Navigation
      </div>

      <div onClick={handleClick} className="space-y-1">
        <NavLink href="/home">Home</NavLink>
        <NavLink href="/suggestions">Suggestions</NavLink>
        <NavLink href="/pos">Purchase Orders</NavLink>
        <NavLink href="/suppliers">Suppliers</NavLink>
        <NavLink href="/uploads">Uploads</NavLink>
        <NavLink href="/outbox">Outbox</NavLink>
        <NavLink href="/audit">Audit</NavLink>
        <NavLink href="/templates">Templates</NavLink>
        <NavLink href="/settings">Settings</NavLink>

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
