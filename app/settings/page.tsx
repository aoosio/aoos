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
  const [form, setForm] = useState({ default_language: 'ar', ssi_days: 14, sla_target_days: 3, default_dial_code: '+964' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.from('organizations').select('*').limit(1)
      const o = data?.[0]
      setOrg(o)
      if (o) {
        setForm({
          default_language: o.default_language ?? 'ar',
          ssi_days: o.ssi_days ?? 14,
          sla_target_days: o.sla_target_days ?? 3,
          default_dial_code: o.default_dial_code ?? '+964'
        })
      }
    })()
  }, [])

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setSaving(true); setMsg(null)
    const { error } = await supabase.from('organizations').update({
      default_language: form.default_language,
      ssi_days: form.ssi_days,
      sla_target_days: form.sla_target_days,
      default_dial_code: form.default_dial_code
    }).eq('id', org.id)
    setSaving(false)
    setMsg(error ? error.message : 'Saved.')
    // Apply language immediately
    if (!error && typeof document !== 'undefined') {
      document.documentElement.lang = form.default_language
      document.documentElement.dir = form.default_language === 'ar' ? 'rtl' : 'ltr'
      localStorage.setItem('aoos_lang', form.default_language)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="text-lg font-semibold">Organization</h1>
        <form onSubmit={saveOrg} className="mt-3 grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Default language</Label>
            <Select value={form.default_language} onChange={(e) => setForm({ ...form, default_language: e.target.value as 'ar'|'en' })}>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </Select>
          </div>
          <div>
            <Label>Safe-sell interval (days)</Label>
            <Input type="number" value={form.ssi_days} onChange={(e) => setForm({ ...form, ssi_days: Number(e.target.value) })} />
          </div>
          <div>
            <Label>SLA target (days)</Label>
            <Input type="number" value={form.sla_target_days} onChange={(e) => setForm({ ...form, sla_target_days: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Default dial code</Label>
            <Input value={form.default_dial_code} onChange={(e) => setForm({ ...form, default_dial_code: e.target.value })} placeholder="+964" />
          </div>
          <div className="sm:col-span-4 mt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
          </div>
        </form>
      </Card>

      {/* Keep your WhatsApp Connect card below if you added it earlier */}
    </div>
  )
}
