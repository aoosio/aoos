'use client'
import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function ForgotPage() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false)

  async function sendReset() {
    setBusy(true); setMsg(null)
    try {
      const supabase = await getSupabaseClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setMsg('Check your email for the reset link.')
    } catch (e: any) { setMsg(e.message || 'Failed to send reset link') } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
      <p className="mb-4 text-neutral-600">Enter your email to receive a reset link.</p>
      <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button onClick={sendReset} disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send reset link'}</button>
        <p className="mt-2 text-sm">Remembered it? <a href="/auth/sign-in" className="underline">Sign in</a></p>
      </div>
    </main>
  )
}
