'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [dial, setDial] = useState('+964')
  const [lang, setLang] = useState<'ar'|'en'>('ar')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function createOrg() {
    setBusy(true); setMsg(null)
    const { data, error } = await supabase.rpc('create_org_for_me', { p_name: name, p_dial: dial, p_lang: lang })
    setBusy(false)
    if (error) setMsg(error.message)
    else router.push('/people')
  }

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">Create your market</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="mb-1 block text-sm">Market name</label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Al-Noor Market" /></div>
        <div><label className="mb-1 block text-sm">Default dial code</label><Input value={dial} onChange={e=>setDial(e.target.value)} /></div>
        <div>
          <label className="mb-1 block text-sm">Default language</label>
          <select className="w-full rounded-md border border-slate-200 p-2" value={lang} onChange={e=>setLang(e.target.value as any)}>
            <option value="ar">AR</option><option value="en">EN</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <Button onClick={createOrg} disabled={busy}>{busy ? 'Creating…' : 'Create'}</Button>
          {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
        </div>
      </div>
    </Card>
  )
}
