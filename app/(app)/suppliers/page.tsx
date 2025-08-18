'use client'
import { useEffect, useState } from 'react'
type Supplier = { id: string; name: string; phone: string; preferred_language: string | null; updated_at: string | null }

export default function SuppliersPage() {
  const [list, setList] = useState<Supplier[]>([])
  const [name, setName] = useState(''); const [phone, setPhone] = useState('')
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false)

  async function load() {
    setMsg(null)
    const res = await fetch('/api/suppliers/list', { cache: 'no-store' })
    const j = await res.json()
    if (!res.ok) { setMsg(j.error || 'Failed to load'); return }
    setList(j.suppliers || [])
  }
  async function add() {
    setMsg(null)
    if (!name.trim() || !phone.trim()) { setMsg('Name and phone are required'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/suppliers/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), preferred_language: lang }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to add')
      setName(''); setPhone(''); await load(); setMsg('Supplier added.')
    } catch (e:any) { setMsg(e.message) } finally { setBusy(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <main className="space-y-6">
      <section className="rounded border p-4 shadow-soft max-w-xl">
        <h2 className="font-semibold">Add supplier</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Phone (E.164)" value={phone} onChange={e=>setPhone(e.target.value)} />
          <select className="rounded border px-3 py-2 sm:col-span-2" value={lang} onChange={e=>setLang(e.target.value as any)}>
            <option value="en">English</option><option value="ar">العربية</option>
          </select>
          <button onClick={add} disabled={busy} className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50 sm:col-span-2">
            {busy ? 'Saving…' : 'Save supplier'}
          </button>
          {msg && <p className="text-sm sm:col-span-2">{msg}</p>}
        </div>
      </section>

      <section className="rounded border p-4 shadow-soft">
        <h2 className="font-semibold mb-2">Suppliers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left">
              <th className="py-1 pr-3">Name</th><th className="py-1 pr-3">Phone</th><th className="py-1 pr-3">Language</th><th className="py-1 pr-3">Updated</th>
            </tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="py-1 pr-3">{s.name}</td>
                  <td className="py-1 pr-3">{s.phone}</td>
                  <td className="py-1 pr-3">{s.preferred_language || '-'}</td>
                  <td className="py-1 pr-3">{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {!list.length && <tr><td className="py-2 text-neutral-500">No suppliers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
