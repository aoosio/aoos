'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

type OrgSettings = {
  id?: string
  name?: string | null
  industry_type?: string | null
  country?: string | null
  state?: string | null
  phone?: string | null
  default_language?: 'en' | 'ar' | null
  ssi_days?: number | null
  sla_target_days?: number | null
  default_dial_code?: string | null
}
type WhatsAppSettings = {
  phone_number_id?: string | null
  waba_id?: string | null
  token_masked?: string | null
  token_hint?: string | null
  is_connected?: boolean
}

export default function SettingsPage() {
  const [tab, setTab] = useState<'account'|'org'|'whatsapp'>('account')

  const [newPass, setNewPass] = useState(''); const [confirm, setConfirm] = useState('')
  const [accMsg, setAccMsg] = useState<string | null>(null); const [accBusy, setAccBusy] = useState(false)

  const [org, setOrg] = useState<OrgSettings | null>(null); const [orgBusy, setOrgBusy] = useState(false); const [orgMsg, setOrgMsg] = useState<string | null>(null)

  const [wa, setWa] = useState<WhatsAppSettings | null>(null); const [waBusy, setWaBusy] = useState(false); const [waMsg, setWaMsg] = useState<string | null>(null)
  const [waToken, setWaToken] = useState('')

  async function load() {
    const r = await fetch('/api/settings/get', { cache: 'no-store' })
    const j = await r.json()
    if (!r.ok) { setOrg(null); setWa(null); setOrgMsg(j.error || 'Failed to load settings'); return }
    setOrg(j.org || {}); setWa(j.whatsapp || {})
  }
  useEffect(() => { load() }, [])

  async function saveOrg() {
    setOrgBusy(true); setOrgMsg(null)
    try {
      const r = await fetch('/api/settings/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ org }) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed to save')
      setOrgMsg('Saved.'); await load()
    } catch (e: any) { setOrgMsg(e.message) } finally { setOrgBusy(false) }
  }

  async function saveWA() {
    setWaBusy(true); setWaMsg(null)
    try {
      const payload = { whatsapp: { phone_number_id: wa?.phone_number_id || '', waba_id: wa?.waba_id || '', access_token: waToken || undefined } }
      const r = await fetch('/api/settings/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed to save')
      setWaMsg('Saved.'); setWaToken(''); await load()
    } catch (e: any) { setWaMsg(e.message) } finally { setWaBusy(false) }
  }

  async function testWA() {
    setWaBusy(true); setWaMsg(null)
    try {
      const r = await fetch('/api/settings/whatsapp/test', { method: 'POST' })
      const j = await r.json()
      if (j.ok) setWaMsg('Connection OK'); else setWaMsg(`Graph error: ${j.status} ${j.error || ''}`)
      await load()
    } catch (e:any) { setWaMsg(e.message) } finally { setWaBusy(false) }
  }

  async function changePassword() {
    setAccMsg(null)
    if (!newPass || newPass.length < 8) { setAccMsg('Password must be at least 8 characters.'); return }
    if (newPass !== confirm) { setAccMsg('Passwords do not match.'); return }
    setAccBusy(true)
    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error
      setAccMsg('Password updated.'); setNewPass(''); setConfirm('')
    } catch (e: any) { setAccMsg(e.message || 'Failed to update password') } finally { setAccBusy(false) }
  }

  const lang = (org?.default_language || 'en') as 'en'|'ar'

  return (
    <main className="space-y-8">
      <div className="flex gap-2">
        <button onClick={()=>setTab('account')} className={`rounded px-3 py-1 text-sm border ${tab==='account'?'bg-brand/10 border-brand':'border-neutral-300'}`}>Account</button>
        <button onClick={()=>setTab('org')} className={`rounded px-3 py-1 text-sm border ${tab==='org'?'bg-brand/10 border-brand':'border-neutral-300'}`}>Organization</button>
        <button onClick={()=>setTab('whatsapp')} className={`rounded px-3 py-1 text-sm border ${tab==='whatsapp'?'bg-brand/10 border-brand':'border-neutral-300'}`}>WhatsApp</button>
      </div>

      {tab==='account' && (
        <section className="rounded border p-4 shadow-soft max-w-xl">
          <h2 className="mb-2 font-semibold">Change password</h2>
          <div className="grid gap-3">
            <input type="password" className="rounded border px-3 py-2" placeholder="New password (min 8 chars)" value={newPass} onChange={e=>setNewPass(e.target.value)} />
            <input type="password" className="rounded border px-3 py-2" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
            {accMsg && <p className="text-sm">{accMsg}</p>}
            <button onClick={changePassword} disabled={accBusy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">{accBusy?'Saving…':'Update password'}</button>
          </div>
        </section>
      )}

      {tab==='org' && org && (
        <section className="rounded border p-4 shadow-soft">
          <h2 className="mb-2 font-semibold">Organization settings</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">Name
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.name || ''} onChange={e=>setOrg(o=>({ ...(o||{}), name:e.target.value }))} />
            </label>

            <label className="text-sm">Default language
              <select className="mt-1 w-full rounded border px-3 py-2" value={lang} onChange={e=>setOrg(o=>({ ...(o||{}), default_language: e.target.value as any }))}>
                <option value="en">English</option><option value="ar">العربية</option>
              </select>
            </label>

            <label className="text-sm md:col-span-2">Industry / Type
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.industry_type || ''} onChange={e=>setOrg(o=>({ ...(o||{}), industry_type:e.target.value }))} />
            </label>

            <label className="text-sm">Country
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.country || ''} onChange={e=>setOrg(o=>({ ...(o||{}), country:e.target.value }))} />
            </label>

            <label className="text-sm">State / Province
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.state || ''} onChange={e=>setOrg(o=>({ ...(o||{}), state:e.target.value }))} />
            </label>

            <label className="text-sm">Phone
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.phone || ''} onChange={e=>setOrg(o=>({ ...(o||{}), phone:e.target.value }))} />
            </label>

            <label className="text-sm">Default dial code
              <input className="mt-1 w-full rounded border px-3 py-2" value={org.default_dial_code || ''} onChange={e=>setOrg(o=>({ ...(o||{}), default_dial_code:e.target.value }))} />
            </label>

            <label className="text-sm">Safety stock (days)
              <input type="number" className="mt-1 w-full rounded border px-3 py-2" value={org.ssi_days ?? 0} onChange={e=>setOrg(o=>({ ...(o||{}), ssi_days:Number(e.target.value) }))} />
            </label>

            <label className="text-sm">SLA target (days)
              <input type="number" className="mt-1 w-full rounded border px-3 py-2" value={org.sla_target_days ?? 0} onChange={e=>setOrg(o=>({ ...(o||{}), sla_target_days:Number(e.target.value) }))} />
            </label>

            {orgMsg && <p className="text-sm md:col-span-2">{orgMsg}</p>}
            <div className="md:col-span-2">
              <button onClick={saveOrg} disabled={orgBusy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">
                {orgBusy?'Saving…':'Save settings'}
              </button>
            </div>
          </div>
        </section>
      )}

      {tab==='whatsapp' && (
        <section className="rounded border p-4 shadow-soft">
          <h2 className="mb-2 font-semibold">WhatsApp Business</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">Phone Number ID
              <input className="mt-1 w-full rounded border px-3 py-2" value={wa?.phone_number_id || ''} onChange={e=>setWa(w=>({ ...(w||{}), phone_number_id:e.target.value }))} />
            </label>
            <label className="text-sm">WABA ID
              <input className="mt-1 w-full rounded border px-3 py-2" value={wa?.waba_id || ''} onChange={e=>setWa(w=>({ ...(w||{}), waba_id:e.target.value }))} />
            </label>

            <label className="text-sm md:col-span-2">Access token (paste only when updating)
              <input className="mt-1 w-full rounded border px-3 py-2" placeholder={wa?.token_masked || 'Enter token'} value={waToken} onChange={e=>setWaToken(e.target.value)} />
              {wa?.token_hint && <div className="mt-1 text-xs text-neutral-500">Hint: ends with {wa.token_hint}</div>}
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-2">
              <button onClick={saveWA} disabled={waBusy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">{waBusy?'Saving…':'Save'}</button>
              <button onClick={testWA} disabled={waBusy} className="rounded border px-3 py-2">{waBusy?'Testing…':'Test connection'}</button>
              {wa?.is_connected && <span className="self-center rounded bg-green-100 px-2 py-1 text-xs text-green-800">Connected</span>}
            </div>

            {waMsg && <p className="text-sm md:col-span-2">{waMsg}</p>}
          </div>
        </section>
      )}
    </main>
  )
}
