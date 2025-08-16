// app/auth/sign-in/page.tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()
  const sp = useSearchParams()
  const redirect = sp.get('redirect') || '/home'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); return }
    router.replace(redirect)
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-sm space-y-3 px-6">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email"
             value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password"
             value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="rounded bg-black px-3 py-2 text-white">Continue</button>
    </form>
  )
}
