// app/suppliers/page.tsx
'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'

type Supplier = {
  id: string
  name: string
  phone_e164: string | null
  preferred_language: string | null
  updated_at: string | null
}

type Org = { id: string; default_dial_code: string }

async function loadSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id,name,phone_e164,preferred_language,updated_at')
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Supplier[]
}

async function loadOrg(): Promise<Org | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, default_dial_code')
    .maybeSingle()
  if (error) return null
  if (!data) return null
  return { id: data.id as string, default_dial_code: (data as any).default_dial_code ?? '+964' }
}

function normalizeToE164(raw: string, dial: string) {
  let p = (raw || '').replace(/[\s-]/g, '')
  if (!p) return ''
  if (p.startsWith('+')) return p
  if (dial && dial.startsWith('+')) {
    p = p.replace(/^0+/, '')
    return `${dial}${p}`
  }
  return `+${p}`
}

export default function SuppliersPage() {
  const { t } = useI18n()
  const { data, mutate } = useSWR('suppliers', loadSuppliers)
  const [org, setOrg] = useState<Org | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const o = await loadOrg()
      if (mounted) setOrg(o)
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function addSupplier(formData: FormData) {
    const name = String(formData.get('name') || '').trim()
    const phoneRaw = String(formData.get('phone') || '').trim()
    const lang = String(formData.get('lang') || 'ar')

    if (!name) return setMsg(t('suppliers.name') + ' ' + t('common.required' as any) || 'Name is required.')
    if (!phoneRaw) return setMsg(t('suppliers.phone') + ' ' + t('common.required' as any) || 'Phone is required.')

    const e164 = normalizeToE164(phoneRaw, org?.default_dial_code || '+964')
    if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
      return setMsg('Invalid phone. Use international format like +9647XXXXXXXX.')
    }

    setSaving(true)
    setMsg(null)
    const { error } = await supabase.from('suppliers').insert({
      name,
      phone_e164: e164,
      preferred_language: lang,
    })
    setSaving(false)
    if (error) setMsg(error.message)
    else {
      setMsg(t('common.added'))
      ;(document.getElementById('supplier-form') as HTMLFormElement)?.reset()
      mutate()
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">{t('suppliers.title')}</h1>
        <form id="supplier-form" action={addSupplier} className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">{t('suppliers.name')}</Label>
            <Input id="name" name="name" placeholder="Supplier name" />
          </div>
          <div>
            <Label htmlFor="phone">{t('suppliers.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              placeholder={(org?.default_dial_code || '+964') + '7XXXXXXXX'}
            />
          </div>
          <div>
            <Label htmlFor="lang">{t('common.language')}</Label>
            <Select id="lang" name="lang" defaultValue="ar">
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </Select>
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('suppliers.addSupplier')}
            </Button>
            {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
          </div>
        </form>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>{t('suppliers.name')}</TH>
              <TH>{t('suppliers.phone')}</TH>
              <TH>{t('common.language')}</TH>
              <TH>Updated</TH>
            </TR>
          </THead>
          <TBody>
            {(data ?? []).map((s) => (
              <TR key={s.id}>
                <TD>{s.name}</TD>
                <TD>{s.phone_e164 ?? '-'}</TD>
                <TD>{s.preferred_language?.toUpperCase() ?? '-'}</TD>
                <TD>{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
