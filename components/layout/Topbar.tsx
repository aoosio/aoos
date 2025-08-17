'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function Topbar() {
  const { lang, toggleLocale } = useI18n()

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
      </div>
    </header>
  )
}
