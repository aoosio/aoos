'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function Topbar() {
  const { lang, toggleLocale } = useI18n()
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

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <Link href="/home" className="font-semibold">AOOS</Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLocale}
          className="rounded border px-3 py-1 text-sm"
          aria-label="Toggle language"
        >
          {lang === 'ar' ? 'AR' : 'EN'}
        </button>
        <button
          type="button"
          onClick={signOut}
          disabled={busy}
          className="rounded bg-brand px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
