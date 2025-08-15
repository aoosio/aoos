'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Languages, LogIn, LogOut, User } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'

export default function Topbar() {
  const { lang, setLang } = useI18n()
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
      setChecking(false)
    })
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="md:hidden font-semibold">AOOS</div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          <Languages className="mr-2 h-4 w-4" /> {lang.toUpperCase()}
        </Button>

        {!checking && email && (
          <>
            <span className="hidden items-center gap-2 text-sm text-slate-700 sm:flex">
              <User className="h-4 w-4" /> {email}
            </span>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </>
        )}

        {!checking && !email && (
          <Link href="/login">
            <Button variant="secondary">
              <LogIn className="mr-2 h-4 w-4" /> Sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
