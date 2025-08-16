'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SignInForm({ redirect }: { redirect: string }) {
  // default to MAGIC LINK (safer by default). You can change to 'password' if you prefer.
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setErr(error.message)
      router.replace(redirect)
      return
    }

    // MAGIC LINK
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`,
      },
    })
    if (error) return setErr(error.message)
    setSent(true)
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <h2 className="mb-4 text-xl font-semibold">Sign in</h2>

      <div className="mb-3 flex gap-2 text-sm">
        <button
          type="button"
          className={`underline-offset-4 ${mode === 'magic' ? 'underline' : ''}`}
          onClick={() => setMode('magic')}
        >
          Magic link
        </button>
        <button
          type="button"
          className={`underline-offset-4 ${mode === 'password' ? 'underline' : ''}`}
          onClick={() => setMode('password')}
        >
          Password
        </button>
      </div>

      {sent ? (
        <p className="text-sm text-slate-600">Check your email for the sign‑in link.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode === 'password' && (
            <input
              className="w-full rounded border px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button className="rounded bg-black px-3 py-2 text-white" type="submit">
            Continue
          </button>
        </form>
      )}
    </div>
  )
}
