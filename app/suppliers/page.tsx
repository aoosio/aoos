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
  preferred_language: 'ar' | 'en' | null
  updated_at: string | null
}
type Org = { id: string; default_dial_code: string }

async function loadSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id,name,phone_e164,preferred_language,updated_at')
    .order('name', { ascending: true })
  if (error) throw error
  return data as Supplier[]
}

async function loadOrg(): Promise<Org | null> {
  const { data } = await supabase.from('organizations').select('id,default_dial_code').maybeSingle()
  if (!data) return null
  return { id: data.id as string, default_dial_code: (data as any).default_dial_code ?? '+964' }
}

function normalizeToE164(raw: string, dial: string) {
  let p = (raw || '').replace(/[\s-]/g, '')
  if (!p) return ''
  if (p.startsWith('+')) return p
  p = p.replace(/^0+/, '')
  return `${dial}${p}`
}

export default function SuppliersPage() {
  const { t } = useI18n()
  const { data, mutate } = useSWR('suppliers', loadSuppliers)
  const [org, setOrg] = useState<Org | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // add form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  // inline edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLang, setEditLang] = useState<'ar' | 'en'>('ar')

  useEffect(() => { loadOrg().then(setOrg) }, [])

  async function addSupplier() {
    if (!name.trim()) return setMsg('Name is required.')
    if (!phone.trim()) return setMsg('Phone is required.')

    const e164 = normalizeToE164(phone, org?.default_dial_code || '+964')
    if (!/^\+[1-9]\d{7,14}$/.test(e164)) return setMsg('Invalid phone format.')

    setSaving(true); setMsg(null)
    const { error } = await supabase.from('suppliers').insert({
      name: name.trim(),
      phone_e164: e164,
      preferred_language: lang,
    })
    setSaving(false)
    if (error) setMsg(error.message)
    else {
      setMsg(t('suppliers.added'))
      setName(''); setPhone('')
      void mutate()
    }
  }

  function startEdit(s: Supplier) {
    setEditId(s.id)
    setEditName(s.name ?? '')
    setEditPhone(s.phone_e164 ?? '')
    setEditLang((s.preferred_language ?? 'ar') as 'ar' | 'en')
  }

  function cancelEdit() {
    setEditId(null)
    setEditName(''); setEditPhone('')
  }

  async function saveEdit(id: string) {
    const e164 = editPhone.startsWith('+')
      ? editPhone
      : normalizeToE164(editPhone, org?.default_dial_code || '+964')
    if (e164 && !/^\+[1-9]\d{7,14}$/.test(e164)) return setMsg('Invalid phone format.')

    setSaving(true); setMsg(null)
    const { error } = await supabase
      .from('suppliers')
      .update({ name: editName.trim(), phone_e164: e164 || null, preferred_language: editLang })
      .eq('id', id)
    setSaving(false)
    if (error) setMsg(error.message)
    else { setMsg(t('suppliers.updated')); setEditId(null); void mutate() }
  }

  async function removeSupplier(id: string) {
    const ok = confirm('Delete supplier?')
    if (!ok) return
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) setMsg(error.message)
    else { setMsg(t('suppliers.removed')); void mutate() }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">{t('suppliers.title')}</h1>

        {/* Add supplier */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="s-name">{t('suppliers.name')}</Label>
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name" />
          </div>
          <div>
            <Label htmlFor="s-phone">{t('suppliers.phone')}</Label>
            <Input
              id="s-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={(org?.default_dial_code || '+964') + '7XXXXXXXX'}
            />
          </div>
          <div>
            <Label htmlFor="s-lang">{t('suppliers.lang')}</Label>
            <Select id="s-lang" value={lang} onChange={(e) => setLang(e.target.value as 'ar' | 'en')}>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </Select>
          </div>
          <div className="sm:col-span-4">
            <Button onClick={() => { void addSupplier() }} disabled={saving || !name.trim() || !phone.trim()}>
              {t('suppliers.add')}
            </Button>
            {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR>
              <TH>{t('suppliers.name')}</TH>
              <TH>{t('suppliers.phone')}</TH>
              <TH>{t('suppliers.lang')}</TH>
              <TH>Updated</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {(data ?? []).map((s) => {
              const editing = editId === s.id
              return (
                <TR key={s.id}>
                  <TD>
                    {editing
                      ? <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                      : s.name}
                  </TD>
                  <TD>
                    {editing
                      ? <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                      : (s.phone_e164 ?? '-')}
                  </TD>
                  <TD>
                    {editing ? (
                      <Select value={editLang} onChange={(e) => setEditLang(e.target.value as 'ar' | 'en')}>
                        <option value="ar">AR</option>
                        <option value="en">EN</option>
                      </Select>
                    ) : (s.preferred_language?.toUpperCase() ?? '-')}
                  </TD>
                  <TD>{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</TD>
                  <TD className="w-[12rem]">
                    {editing ? (
                      <div className="flex gap-2">
                        <Button className="h-8 px-3 text-xs" onClick={() => { void saveEdit(s.id) }} disabled={saving}>
                          {t('common.save')}
                        </Button>
                        <Button className="h-8 px-3 text-xs" variant="secondary" onClick={cancelEdit}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button className="h-8 px-3 text-xs" variant="secondary" onClick={() => startEdit(s)}>
                          {t('common.edit')}
                        </Button>
                        <Button className="h-8 px-3 text-xs" variant="secondary" onClick={() => { void removeSupplier(s.id) }}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    )}
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
