'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    (async () => {
      const code = sp.get('code')
      if (code) {
        // v2 signature in your install expects a string
        await supabase.auth.exchangeCodeForSession(code)
      }
      router.replace('/home')
    })()
  }, [router, sp])

  return null
}
