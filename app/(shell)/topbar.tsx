'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export default function Topbar() {
  const { lang, setLang, t } = useI18n()
  const [email, setEmail] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email ?? null)
    })()
  }, [])

  function toggleLang() {
    const next = lang === 'ar' ? 'en' : 'ar'
    setLang(next)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
      localStorage.setItem('aoos_lang', next)
    }
  }

  async function signOut() {
    setBusy(true)
    await supabase.auth.signOut()
    setBusy(false)
    location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white/60 backdrop-blur">
      <Link href="/" className="font-semibold text-blue-700">AOOS</Link>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={toggleLang} aria-label="Toggle language">
          {lang.toUpperCase()}☆
        </Button>

        {email ? (
          <>
            <span className="text-sm text-slate-600 hidden sm:inline">{email}</span>
            <Button onClick={signOut} disabled={busy}>{busy ? t('common.signingOut') : t('common.signOut')}</Button>
          </>
        ) : (
          <Link href="/login" className="rounded-2xl bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200">
            {t('common.signIn')}
          </Link>
        )}
      </div>
    </header>
  )
}
