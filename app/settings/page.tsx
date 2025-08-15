'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [channel, setChannel] = useState<any>(null)
  const [form, setForm] = useState({ phone_number_id: '', waba_id: '', token: '' })
  const [savingOrg, setSavingOrg] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: orgs } = await supabase.from('organizations').select('*').limit(1)
      const o = orgs?.[0]; setOrg(o)
      if (o) {
        const { data: ch } = await supabase.from('channel_whatsapp').select('*').eq('org_id', o.id).limit(1)
        const cw = ch?.[0]; setChannel(cw)
        setForm({ phone_number_id: cw?.phone_number_id ?? '', waba_id: cw?.waba_id ?? '', token: '' })
      }
    })()
  }, [])

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    const f = e.target as HTMLFormElement
    const default_language = (f.elements.namedItem('default_language') as HTMLSelectElement).value
    const ssi_days = Number((f.elements.namedItem('ssi_days') as HTMLInputElement).value)
    const sla_target_days = Number((f.elements.namedItem('sla_target_days') as HTMLInputElement).value)
    setSavingOrg(true); setMsg(null)
    const { error } = await supabase.from('organizations').update({ default_language, ssi_days, sla_target_days }).eq('id', org.id)
    setSavingOrg(false)
    setMsg(error ? error.message : 'Organization settings saved.')
  }

  async function connectAndTest() {
    if (!org) return
    setConnecting(true); setMsg(null)
    const res = await fetch('/api/connect-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: org.id,
        phone_number_id: form.phone_number_id,
        waba_id: form.waba_id,
        access_token: form.token
      })
    })
    setConnecting(false)
    if (!res.ok) { setMsg(await res.text()); return }
    const j = await res.json()
    setMsg(j.ok ? 'Connected and tested successfully.' : `Saved, but test failed: ${j.last_error}`)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="text-lg font-semibold">Organization</h1>
        <form onSubmit={saveOrg} className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Default language</Label>
            <Select name="default_language" defaultValue={org?.default_language ?? 'ar'}>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </Select>
          </div>
          <div>
            <Label>Safe-sell interval (days)</Label>
            <Input name="ssi_days" type="number" defaultValue={org?.ssi_days ?? 14} />
          </div>
          <div>
            <Label>SLA target (days)</Label>
            <Input name="sla_target_days" type="number" defaultValue={org?.sla_target_days ?? 3} />
          </div>
          <div className="sm:col-span-3 mt-2">
            <Button type="submit" disabled={savingOrg}>{savingOrg ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Connect WhatsApp (per org)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Phone Number ID</Label>
            <Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} placeholder="e.g., 1234567890" />
          </div>
          <div>
            <Label>WABA ID</Label>
            <Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} placeholder="e.g., 987654321" />
          </div>
          <div>
            <Label>Access Token (never stored in frontend)</Label>
            <Input type="password" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="paste once to encrypt & save" />
          </div>
          <div className="sm:col-span-3 mt-2">
            <Button onClick={connectAndTest} disabled={connecting}>
              {connecting ? 'Connecting…' : 'Connect & Test'}
            </Button>
            {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
          </div>
        </div>
      </Card>

      {/* Invite member (Owner/Admin) — unchanged from earlier; keep if you added it */}
    </div>
  )
}
