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

  useEffect(() => {
    ;(async () => {
      const { data: orgs } = await supabase.from('organizations').select('*').limit(1)
      const org = orgs?.[0]
      setOrg(org)
      if (org) {
        const { data: ch } = await supabase.from('channel_whatsapp').select('*').eq('org_id', org.id).limit(1)
        const cw = ch?.[0]
        setChannel(cw)
        setForm({ phone_number_id: cw?.phone_number_id ?? '', waba_id: cw?.waba_id ?? '', token: '' })
      }
    })()
  }, [])

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    const formEl = e.target as HTMLFormElement
    const default_language = (formEl.elements.namedItem('default_language') as HTMLSelectElement).value
    const ssi_days = Number((formEl.elements.namedItem('ssi_days') as HTMLInputElement).value)
    const sla_target_days = Number((formEl.elements.namedItem('sla_target_days') as HTMLInputElement).value)
    const { error } = await supabase.from('organizations').update({ default_language, ssi_days, sla_target_days }).eq('id', org.id)
    if (error) alert(error.message)
    else alert('Saved')
  }

  async function saveChannel(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    // Save IDs directly; token should be submitted to your secure backend for encryption
    const { error } = await supabase.from('channel_whatsapp').upsert({
      org_id: org.id,
      phone_number_id: form.phone_number_id || null,
      waba_id: form.waba_id || null,
      connect_method: 'MANUAL',
      is_connected: true
    }, { onConflict: 'org_id' })
    if (error) alert(error.message)
    else alert('Channel IDs saved (token should be saved via secure backend).')
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
          <div className="sm:col-span-3 mt-2"><Button type="submit">Save</Button></div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Connect WhatsApp (per org)</h2>
        <p className="text-sm text-slate-600">Paste Phone Number ID & WABA ID here. Submit the token to your secure backend API to encrypt and store in DB.</p>
        <form onSubmit={saveChannel} className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Phone Number ID</Label>
            <Input value={form.phone_number_id} onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })} placeholder="e.g., 1234567890" />
          </div>
          <div>
            <Label>WABA ID</Label>
            <Input value={form.waba_id} onChange={(e) => setForm({ ...form, waba_id: e.target.value })} placeholder="e.g., 987654321" />
          </div>
          <div>
            <Label>Token (submit via backend)</Label>
            <Input type="password" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="paste here" />
          </div>
          <div className="sm:col-span-3 mt-2"><Button type="submit">Save IDs</Button></div>
        </form>
      </Card>
    </div>
  )
}