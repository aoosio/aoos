'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const qp = useSearchParams()
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // If this page is opened directly by the email link (with ?code=...),
  // auth session will already be established by /auth/callback (we route via it).
  // Here, just verify we have a session before enabling the form.
  useEffect(() => {
    (async () => {
      try {
        const supabase = await getSupabaseClient()
        const { data } = await supabase.auth.getSession()
        setSessionReady(!!data.session)
        if (!data.session) {
          setMsg('Reset link expired or invalid. Request a new one.')
        }
      } catch (e: any) {
        setMsg(e.message || 'Could not verify session')
      }
    })()
  }, [qp])

  async function update() {
    if (!sessionReady) return
    if (!newPass || newPass.length < 8) { setMsg('Password must be at least 8 characters.'); return }
    if (newPass !== confirm) { setMsg('Passwords do not match.'); return }

    setBusy(true); setMsg(null)
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      window.location.href = '/home'
    } catch (e: any) {
      setMsg(e.message || 'Failed to set new password')
    } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Set a new password</h1>
      <p className="mb-4 text-neutral-600">Enter a new password for your account.</p>
      <div className="space-y-3">
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          placeholder="New password"
          value={newPass}
          onChange={e=>setNewPass(e.target.value)}
          disabled={!sessionReady}
        />
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          placeholder="Confirm password"
          value={confirm}
          onChange={e=>setConfirm(e.target.value)}
          disabled={!sessionReady}
        />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button
          onClick={update}
          disabled={!sessionReady || busy}
          className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </div>
    </main>
  )
}
