// components/layout/Topbar.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function Topbar() {
  const { lang, toggleLocale, t } = useI18n()
  const pathname = usePathname()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    setBusy(true)
    try {
      const supabase = await getSupabaseClient()
      await supabase.auth.signOut()
      window.location.href = '/auth/sign-in'
    } finally {
      setBusy(false)
    }
  }

  const is = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur">
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/home" className={`hover:underline ${is('/home') ? 'font-semibold' : ''}`}>Home</Link>
        <Link href="/suggestions" className={`hover:underline ${is('/suggestions') ? 'font-semibold' : ''}`}>Suggestions</Link>
        <Link href="/pos" className={`hover:underline ${is('/pos') ? 'font-semibold' : ''}`}>POs</Link>
        <Link href="/suppliers" className={`hover:underline ${is('/suppliers') ? 'font-semibold' : ''}`}>Suppliers</Link>
        <Link href="/uploads" className={`hover:underline ${is('/uploads') ? 'font-semibold' : ''}`}>Uploads</Link>
        <Link href="/outbox" className={`hover:underline ${is('/outbox') ? 'font-semibold' : ''}`}>Outbox</Link>
        <Link href="/audit" className={`hover:underline ${is('/audit') ? 'font-semibold' : ''}`}>Audit</Link>
      </nav>

      <div className="flex items-center gap-2">
        <button onClick={toggleLocale} className="rounded border px-2 py-1 text-xs">
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
        <Link href="/settings" className="rounded border px-2 py-1 text-xs">
          Settings
        </Link>
        <button
          onClick={signOut}
          disabled={busy}
          className="rounded bg-brand px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {busy ? '…' : t('signOut')}
        </button>
      </div>
    </header>
  )
}
