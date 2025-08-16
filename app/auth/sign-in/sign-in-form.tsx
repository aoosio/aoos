'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SignInForm({ redirect }: { redirect: string }) {
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      if (mode === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace(redirect)
        return
      }
      // Magic link sign-in/signup → force onboarding after callback
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${baseUrl}/auth/callback?redirect=/onboarding` },
      })
      if (error) throw error
      setMsg('Check your email for the sign‑in link.')
    } catch (err: any) {
      setMsg(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-4 text-xl font-semibold">Sign in</h1>

      <div className="mb-3 flex gap-2 text-sm">
        <button type="button" onClick={() => setMode('magic')}
          className={`underline-offset-4 ${mode==='magic' ? 'underline' : ''}`}>Magic link</button>
        <button type="button" onClick={() => setMode('password')}
          className={`underline-offset-4 ${mode==='password' ? 'underline' : ''}`}>Password</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email"
               value={email} onChange={(e)=>setEmail(e.target.value)} required />
        {mode === 'password' && (
          <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password"
                 value={password} onChange={(e)=>setPassword(e.target.value)} required />
        )}
        {msg && <p className="text-sm text-neutral-700">{msg}</p>}
        <button disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">
          {busy ? 'Please wait…' : 'Continue'}
        </button>
      </form>
    </main>
  )
}
