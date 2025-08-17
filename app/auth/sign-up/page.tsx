'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function signUp() {
    setBusy(true); setMsg(null)
    try {
      const supabase = await getSupabaseClient()
      const redirectTo = `${APP_URL || location.origin}/auth/callback`
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setMsg('Check your email to confirm your account.')
    } catch (e: any) {
      setMsg(e.message || 'Failed to sign up')
    } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Create account</h1>
      <div className="mt-4 space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="w-full rounded border px-3 py-2" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button onClick={signUp} disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">
          {busy ? 'Creating…' : 'Sign up'}
        </button>
        <p className="mt-2 text-sm">
          Already have an account? <a href="/auth/sign-in" className="underline">Sign in</a>
        </p>
      </div>
    </main>
  )
}
