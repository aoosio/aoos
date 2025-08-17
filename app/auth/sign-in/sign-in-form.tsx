'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignInForm() {
  const qp = useSearchParams()
  const [email, setEmail] = useState(qp.get('email') || '')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function signInPassword() {
    setBusy(true); setMsg(null)
    const supabase = createClientComponentClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false); if (error) setMsg(error.message)
    else window.location.href = '/home'
  }

  async function sendMagic() {
    setBusy(true); setMsg(null)
    const supabase = createClientComponentClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setBusy(false); if (error) setMsg(error.message)
    else setMsg('Check your email for the magic link.')
  }

  return (
    <form className="space-y-3">
      <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="w-full rounded border px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={signInPassword} disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">Sign in</button>
        <button type="button" onClick={sendMagic} disabled={busy} className="rounded border px-3 py-2 disabled:opacity-50">Magic link</button>
      </div>
    </form>
  )
}
