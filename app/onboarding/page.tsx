'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type OrgForm = {
  name: string
  industry_type: string
  country: string
  state: string
  phone: string
  default_language: 'en' | 'ar'
}

const INDUSTRY = [
  { group: 'FMCG', items: [
    { value: 'FMCG_SINGLE', label: 'FMCG — Single Market' },
    { value: 'FMCG_CHAIN', label: 'FMCG — Chain' },
    { value: 'FMCG_WHOLESALER', label: 'FMCG — Wholesaler' },
  ]},
  { group: 'Pharma', items: [
    { value: 'PHARMA_PHARMACY', label: 'Pharma — Pharmacy' },
    { value: 'PHARMA_DRUGSTORE', label: 'Pharma — Drugstore' },
    { value: 'PHARMA_DISTRIBUTOR', label: 'Pharma — Distributor' },
  ]},
  { group: 'Other', items: [
    { value: 'OTHER', label: 'Other (specify in name/notes)' },
  ]},
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState<OrgForm>({
    name: '',
    industry_type: '',
    country: '',
    state: '',
    phone: '',
    default_language: 'en',
  })

  // If org already exists for this user → go to /home
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/settings/get', { cache: 'no-store' })
        const j = await r.json()
        if (r.ok && j?.org?.id) {
          router.replace('/home')
          return
        }
      } catch {}
      setLoading(false)
    })()
  }, [router])

  async function submit() {
    setMsg(null)
    if (!f.name || f.name.trim().length < 2) {
      setMsg('Please enter an organization name.')
      return
    }
    setBusy(true)
    try {
      const r = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed to create organization')
      router.replace('/home')
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-xl font-semibold">Preparing…</h1>
        <p className="text-neutral-600">Checking your account.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Create your organization</h1>
      <p className="mb-6 text-neutral-600">You’ll do this once. Next time you’ll go straight to the dashboard.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm md:col-span-2">Organization name
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={f.name}
            onChange={e=>setF(s=>({ ...s, name: e.target.value }))} />
        </label>

        <label className="text-sm md:col-span-2">Industry / Type
          <select className="mt-1 w-full rounded border px-3 py-2"
            value={f.industry_type}
            onChange={e=>setF(s=>({ ...s, industry_type: e.target.value }))}>
            <option value="">Select…</option>
            {INDUSTRY.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="text-sm">Country
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={f.country}
            onChange={e=>setF(s=>({ ...s, country: e.target.value }))} />
        </label>

        <label className="text-sm">State / Province
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={f.state}
            onChange={e=>setF(s=>({ ...s, state: e.target.value }))} />
        </label>

        <label className="text-sm">Phone
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={f.phone}
            onChange={e=>setF(s=>({ ...s, phone: e.target.value }))} />
        </label>

        <label className="text-sm">Default language
          <select className="mt-1 w-full rounded border px-3 py-2"
            value={f.default_language}
            onChange={e=>setF(s=>({ ...s, default_language: e.target.value as 'en' | 'ar' }))}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>

        {msg && <p className="md:col-span-2 text-sm text-red-600">{msg}</p>}

        <div className="md:col-span-2">
          <button onClick={submit} disabled={busy}
            className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50">
            {busy ? 'Saving…' : 'Create organization'}
          </button>
        </div>
      </div>
    </main>
  )
}
