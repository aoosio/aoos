'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function Topbar() {
  const router = useRouter()
  const { lang, toggleLang } = useI18n()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => { if (mounted) setEmail(data.user?.email ?? null) })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setEmail(sess?.user?.email ?? null))
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/auth/sign-in')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-brand" aria-hidden />
          <span className="font-semibold">AOOS</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLang} className="text-sm underline">
            {lang === 'ar' ? 'AR' : 'EN'}
          </button>
          {email ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-700">{email}</span>
              <button onClick={signOut} className="rounded border px-3 py-1 text-sm">Sign out</button>
            </div>
          ) : (
            <button onClick={()=>router.push('/auth/sign-in')} className="rounded bg-brand px-3 py-1 text-sm text-white">
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
