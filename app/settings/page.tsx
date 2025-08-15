'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'

type OrgRow = {
  id: string
  default_language: 'ar' | 'en'
  ssi_days: number
  sla_target_days: number
  default_dial_code: string
}

export default function SettingsPage() {
  const { t } = useI18n()

  const [org, setOrg] = useState<OrgRow | null>(null)
  const [form, setForm] = useState<OrgRow>({
    id: '',
    default_language: 'ar',
    ssi_days: 14,
    sla_target_days: 3,
    default_dial_code: '+964',
  })
  const [initial, setInitial] = useState<OrgRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // WhatsApp connect
  const [cw, setCw] = useState<{ phone_number_id: string; waba_id: string }>({ phone_number_id: '', waba_id: '' })
  const [token, setToken] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectMsg, setConnectMsg] = useState<string | null>(null)

  const dirty = useMemo(() => {
    if (!initial) return false
    return JSON.stringify({ ...form, id: undefined }) !== JSON.stringify({ ...initial, id: undefined })
  }, [form, initial])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data: orgs, error } = await supabase.from('organizations').select('*').limit(1)
      if (!error && orgs?.[0]) {
        const o = orgs[0] as OrgRow
        setOrg(o)
        const hydrated: OrgRow = {
          id: o.id,
          default_language: (o.default_language ?? 'ar') as 'ar' | 'en',
          ssi_days: o.ssi_days ?? 14,
          sla_target_days: o.sla_target_days ?? 3,
          default_dial_code: o.default_dial_code ?? '+964',
        }
        setForm(hydrated)
        setInitial(hydrated)

        const { data: ch } = await supabase
          .from('channel_whatsapp')
          .select('phone_number_id,waba_id')
          .eq('org_id', o.id)
          .maybeSingle()

        setCw({
          phone_number_id: (ch as any)?.phone_number_id ?? '',
          waba_id: (ch as any)?.waba_id ?? '',
        })
      }
      setLoading(false)
    })()
  }, [])

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    setSaving(true)
    setMsg(null)

    const { error } = await supabase
      .from('organizations')
      .update({
        default_language: form.default_language,
        ssi_days: form.ssi_days,
        sla_target_days: form.sla_target_days,
        default_dial_code: form.default_dial_code,
      })
      .eq('id', org.id)

    if (!error) {
      // Re-fetch to reflect what was saved
      const { data: orgs } = await supabase.from('organizations').select('*').eq('id', org.id).limit(1)
      const fresh = orgs?.[0] as OrgRow | undefined
      if (fresh) {
        const hydrated: OrgRow = {
          id: fresh.id,
          default_language: (fresh.default_language ?? 'ar') as 'ar' | 'en',
          ssi_days: fresh.ssi_days ?? 14,
          sla_target_days: fresh.sla_target_days ?? 3,
          default_dial_code: fresh.default_dial_code ?? '+964',
        }
        setOrg(hydrated)
        setForm(hydrated)
        setInitial(hydrated)
      }

      // Apply language to document + persist locally
      if (typeof document !== 'undefined') {
        document.documentElement.lang = form.default_language
        document.documentElement.dir = form.default_language === 'ar' ? 'rtl' : 'ltr'
        localStorage.setItem('aoos_lang', form.default_language)
      }

      setMsg(t('common.saved'))
    } else {
      setMsg(error.message)
    }

    setSaving(false)
  }

  async function connectAndTest() {
    if (!org) return
    setConnecting(true)
    setConnectMsg(null)
    const res = await fetch('/api/connect-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: org.id,
        phone_number_id: cw.phone_number_id,
        waba_id: cw.waba_id,
        access_token: token,
      }),
    })
    setConnecting(false)
    if (!res.ok) {
      setConnectMsg(await res.text())
      return
    }
    const j = await res.json()
    setConnectMsg(j.ok ? 'Connected and tested successfully.' : `Saved, but test failed: ${j.last_error}`)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="text-lg font-semibold">{t('settings.org')}</h1>

        {loading ? (
          <div className="py-6 text-sm text-slate-500">{t('common.loading')}</div>
        ) : (
          <form onSubmit={saveOrg} className="mt-3 grid gap-3 sm:grid-cols-4">
            <div>
              <Label>{t('common.defaultLanguage')}</Label>
              <Select
                value={form.default_language}
                onChange={(e) => setForm({ ...form, default_language: e.target.value as 'ar' | 'en' })}
              >
                <option value="ar">AR</option>
                <option value="en">EN</option>
              </Select>
            </div>

            <div>
              <Label>{t('common.ssiDays')}</Label>
              <Input
                type="number"
                value={form.ssi_days}
                onChange={(e) => setForm({ ...form, ssi_days: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>{t('common.slaTargetDays')}</Label>
              <Input
                type="number"
                value={form.sla_target_days}
                onChange={(e) => setForm({ ...form, sla_target_days: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>{t('common.defaultDialCode')}</Label>
              <Input
                value={form.default_dial_code}
                onChange={(e) => setForm({ ...form, default_dial_code: e.target.value })}
                placeholder="+964"
              />
            </div>

            <div className="sm:col-span-4 mt-2 flex items-center gap-3">
              <Button type="submit" disabled={saving || !dirty}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
              <span aria-live="polite" className="text-sm text-slate-600">
                {msg}
              </span>
              {!dirty && !saving && msg === t('common.saved') && (
                <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
              )}
            </div>
          </form>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{t('settings.connect')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Phone Number ID</Label>
            <Input
              value={cw.phone_number_id}
              onChange={(e) => setCw({ ...cw, phone_number_id: e.target.value })}
              placeholder="e.g., 1234567890"
            />
          </div>
          <div>
            <Label>WABA ID</Label>
            <Input
              value={cw.waba_id}
              onChange={(e) => setCw({ ...cw, waba_id: e.target.value })}
              placeholder="e.g., 987654321"
            />
          </div>
          <div>
            <Label>Access Token (paste once)</Label>
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Meta token"
            />
          </div>
          <div className="sm:col-span-3 mt-2">
            <Button onClick={connectAndTest} disabled={connecting || !cw.phone_number_id || !cw.waba_id || !token}>
              {connecting ? t('settings.connecting') : t('settings.connect')}
            </Button>
            {connectMsg && <span className="ml-3 text-sm text-slate-600">{connectMsg}</span>}
          </div>
        </div>
      </Card>
    </div>
  )
}
