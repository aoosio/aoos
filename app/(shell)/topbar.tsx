'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Languages, LogOut, User } from 'lucide-react'

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))

    // bootstrap from localStorage → else org default
    const saved = (typeof window !== 'undefined' && localStorage.getItem('aoos_lang')) as 'ar' | 'en' | null
    if (saved) applyLang(saved)
    else {
      ;(async () => {
        const { data } = await supabase.from('organizations').select('default_language').limit(1)
        const d = (data?.[0]?.default_language as 'ar' | 'en') || 'ar'
        applyLang(d)
      })()
    }
  }, [])

  function applyLang(l: 'ar' | 'en') {
    setLang(l)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    }
    if (typeof localStorage !== 'undefined') localStorage.setItem('aoos_lang', l)
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="md:hidden font-semibold">AOOS</div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => applyLang(lang === 'ar' ? 'en' : 'ar')}>
          <Languages className="mr-2 h-4 w-4" /> {lang.toUpperCase()}
        </Button>
        {userEmail ? (
          <>
            <span className="hidden items-center gap-2 text-sm text-slate-700 sm:flex">
              <User className="h-4 w-4" />
              {userEmail}
            </span>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </>
        ) : null}
      </div>
    </header>
  )
}
