'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
  }, [])
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="md:hidden font-semibold">AOOS</div>
      <div className="flex items-center gap-3">
        {userEmail ? (
          <>
            <span className="hidden sm:flex items-center gap-2 text-sm text-slate-700"><User className="h-4 w-4" />{userEmail}</span>
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4 mr-2"/>Sign out</Button>
          </>
        ) : (
          <Link href="/login"><Button>Sign in</Button></Link>
        )}
      </div>
    </header>
  )
}