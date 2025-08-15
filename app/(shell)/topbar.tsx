'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Languages, LogOut, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { lang, setLang } = useI18n()

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null)) }, [])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="md:hidden font-semibold">AOOS</div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Languages className="mr-2 h-4 w-4" /> {lang.toUpperCase()}
        </Button>
        {userEmail && (
          <>
            <span className="hidden items-center gap-2 text-sm text-slate-700 sm:flex">
              <User className="h-4 w-4" /> {userEmail}
            </span>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
