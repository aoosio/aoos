'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function Topbar() {
  const { lang, setLang, t } = useI18n()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setEmail(data.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-lg font-semibold">AOOS</div>
      <div className="flex items-center gap-3">
        {email ? (
          <>
            <span className="text-sm text-slate-600">{email}</span>
            <Button onClick={() => supabase.auth.signOut()}>{t('common.signOut')}</Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="secondary">{t('common.signIn')}</Button>
          </Link>
        )}
        <Button
          variant="ghost"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          title={t('common.languageTag')}
        >
          ☆{lang.toUpperCase()}
        </Button>
      </div>
    </div>
  )
}
