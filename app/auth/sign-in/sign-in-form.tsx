'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function SignInForm() {
  const qp = useSearchParams()
  const [email, setEmail] = useState(qp.get('email') || '')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function signInPassword() {
    setBusy(true); setMsg(null)
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/home'
    } catch (e: any) {
      setMsg(e.message || 'Sign-in failed')
    } finally { setBusy(false) }
  }

  async function sendMagic() {
    setBusy(true); setMsg(null)
    try {
      const supabase = await getSupabaseClient()
      // ALWAYS use the current origin so Preview deploys work
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setMsg('Check your email for the magic link.')
    } catch (e: any) {
      setMsg(e.message || 'Could not send magic link')
    } finally { setBusy(false) }
  }

  return (
    <form className="space-y-3">
      <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" className="w-full rounded border px-3 py-2" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={signInPassword} disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">Sign in</button>
        <button type="button" onClick={sendMagic} disabled={busy} className="rounded border px-3 py-2 disabled:opacity-50">Magic link</button>
      </div>
      <p className="mt-2 text-sm">
        New here? <a href="/auth/sign-up" className="underline">Create an account</a>
      </p>
    </form>
  )
}
