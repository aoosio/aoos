'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

export default function Topbar() {
  const { t, lang, setLang } = useI18n()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    location.assign('/login')
  }

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar')

  return (
    <div className="flex items-center justify-end gap-3 px-4 py-3">
      {email ? (
        <>
          <Button onClick={signOut}>{t('common.signOut')}</Button>
          <span className="text-sm text-slate-600">{email}</span>
        </>
      ) : (
        <a className="rounded-full bg-slate-100 px-4 py-2 text-sm" href="/login">
          {t('common.signIn')}
        </a>
      )}
      <button
        onClick={toggleLang}
        className="rounded-full bg-slate-100 px-3 py-2 text-sm"
        title="Toggle language"
      >
        ☆{t('common.languageTag')}
      </button>
      <div className="ml-2 text-xl font-semibold">AOOS</div>
    </div>
  )
}
