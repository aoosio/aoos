'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type OrgForm = {
  name: string
  org_type_main: 'FMCG' | 'Pharma' | 'Other'
  org_type_sub: string
  country: string
  state: string
  phone: string
  privacy: boolean
}
const MAIN_TYPES = ['FMCG', 'Pharma', 'Other'] as const
const SUBTYPES: Record<string, string[]> = {
  FMCG: ['single market', 'chain', 'wholesaler'],
  Pharma: ['pharmacy', 'drugstore', 'distributor'],
  Other: ['specify'],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [org, setOrg] = useState<OrgForm>({
    name: '',
    org_type_main: 'FMCG',
    org_type_sub: 'single market',
    country: '',
    state: '',
    phone: '',
    privacy: false,
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function createOrg() {
    if (!org.privacy) { setMsg('You must accept the Privacy Policy'); return }
    if (!org.name.trim()) { setMsg('Organization name is required'); return }

    setBusy(true); setMsg(null)
    try {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMsg('You must be signed in'); setBusy(false); return }

      const res = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({
          name: org.name,
          org_type_main: org.org_type_main,
          org_type_sub: org.org_type_sub,
          country: org.country,
          state: org.state,
          phone: org.phone,
        }),
      })

      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to create organization')
      router.replace('/home')
    } catch (e: any) {
      setMsg(e.message || 'Failed to create organization')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Welcome</h1>
      <p className="mb-6 text-neutral-700">Finish setup to start using AOOS.</p>

      <section className="space-y-3 rounded border p-5 shadow-soft">
        <h2 className="font-semibold">Organization</h2>
        <label className="block text-sm">Organization name</label>
        <input className="w-full rounded border px-3 py-2" placeholder="Organization name" value={org.name} onChange={(e)=>setOrg({...org, name:e.target.value})} />

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Industry</label>
            <select className="w-full rounded border px-3 py-2" value={org.org_type_main}
              onChange={(e)=>{const v=e.target.value as OrgForm['org_type_main']; setOrg(o=>({...o, org_type_main:v, org_type_sub:SUBTYPES[v][0]}))}}>
              {MAIN_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Subtype</label>
            <select className="w-full rounded border px-3 py-2" value={org.org_type_sub}
              onChange={(e)=>setOrg({...org, org_type_sub:e.target.value})}>
              {SUBTYPES[org.org_type_main].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm">Country</label>
            <input className="w-full rounded border px-3 py-2" placeholder="Country" value={org.country}
              onChange={(e)=>setOrg({...org, country:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm">State/Region</label>
            <input className="w-full rounded border px-3 py-2" placeholder="State/Region" value={org.state}
              onChange={(e)=>setOrg({...org, state:e.target.value})} />
          </div>
        </div>

        <label className="block text-sm">Phone</label>
        <input className="w-full rounded border px-3 py-2" placeholder="Phone (+…)" value={org.phone}
          onChange={(e)=>setOrg({...org, phone:e.target.value})} />

        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={org.privacy} onChange={(e)=>setOrg({...org, privacy:e.target.checked})} />
          I agree to the <a href="/privacy" className="underline" target="_blank">Privacy Policy</a>.
        </label>

        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <button disabled={busy} onClick={createOrg} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50">
          {busy ? 'Creating…' : 'Create organization'}
        </button>
      </section>
    </main>
  )
}
