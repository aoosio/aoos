'use client'
import { useState } from 'react'

export default function Settings() {
  // WhatsApp section
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [wabaId, setWabaId] = useState('')
  const [token, setToken] = useState('')
  const [waMsg, setWaMsg] = useState<string | null>(null)
  const [waBusy, setWaBusy] = useState(false)

  async function saveWA() {
    setWaBusy(true); setWaMsg(null)
    const res = await fetch('/api/settings/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number_id: phoneNumberId, waba_id: wabaId, access_token: token })
    })
    const j = await res.json().catch(()=>({}))
    if (!res.ok) setWaMsg(j.error || 'Failed to save')
    else setWaMsg('Saved.')
    setWaBusy(false)
  }

  // Password section
  const [cur, setCur] = useState('')
  const [nw, setNw] = useState('')
  const [nw2, setNw2] = useState('')
  const [pwMsg, setPwMsg] = useState<string | null>(null)
  const [pwBusy, setPwBusy] = useState(false)

  async function changePw() {
    if (!nw || nw.length < 8) { setPwMsg('Password must be at least 8 characters'); return }
    if (nw !== nw2) { setPwMsg('Passwords do not match'); return }
    setPwBusy(true); setPwMsg(null)
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: cur || undefined, new_password: nw })
    })
    const j = await res.json().catch(()=>({}))
    if (!res.ok) setPwMsg(j.error || 'Failed to change password')
    else { setPwMsg('Password updated.'); setCur(''); setNw(''); setNw2('') }
    setPwBusy(false)
  }

  return (
    <main className="space-y-8">
      <section className="rounded border p-4 shadow-soft max-w-xl">
        <h2 className="font-semibold">WhatsApp</h2>
        <div className="mt-3 space-y-3">
          <input className="w-full rounded border px-3 py-2" placeholder="Phone Number ID" value={phoneNumberId} onChange={e=>setPhoneNumberId(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="WABA ID" value={wabaId} onChange={e=>setWabaId(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="Access Token" value={token} onChange={e=>setToken(e.target.value)} />
          <button onClick={saveWA} disabled={waBusy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">{waBusy ? 'Saving…' : 'Save settings'}</button>
          {waMsg && <p className="text-sm">{waMsg}</p>}
        </div>
      </section>

      <section className="rounded border p-4 shadow-soft max-w-xl">
        <h2 className="font-semibold">Change password</h2>
        <div className="mt-3 space-y-3">
          <input type="password" className="w-full rounded border px-3 py-2" placeholder="Current password (optional)" value={cur} onChange={e=>setCur(e.target.value)} />
          <input type="password" className="w-full rounded border px-3 py-2" placeholder="New password (min 8 chars)" value={nw} onChange={e=>setNw(e.target.value)} />
          <input type="password" className="w-full rounded border px-3 py-2" placeholder="Confirm new password" value={nw2} onChange={e=>setNw2(e.target.value)} />
          {pwMsg && <p className="text-sm text-red-600">{pwMsg}</p>}
          <button onClick={changePw} disabled={pwBusy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">{pwBusy ? 'Saving…' : 'Update password'}</button>
        </div>
      </section>
    </main>
  )
}
