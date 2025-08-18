'use client'
import { useEffect, useMemo, useState } from 'react'
type Supplier = { id: string; name: string; phone: string }

export default function NewPOPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [q, setQ] = useState(''); const [supplierId, setSupplierId] = useState<string>(''); const [poMsg, setPoMsg] = useState<string | null>(null)
  useEffect(() => { (async () => {
    const res = await fetch('/api/suppliers/list', { cache: 'no-store' })
    const j = await res.json()
    if (res.ok) setSuppliers(j.suppliers || []); else setPoMsg(j.error || 'Failed to load suppliers')
  })() }, [])

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return suppliers
    return suppliers.filter(s => (s.name||'').toLowerCase().includes(k) || (s.phone||'').toLowerCase().includes(k))
  }, [q, suppliers])

  async function createPO() {
    setPoMsg(null)
    if (!supplierId) { setPoMsg('Select a supplier'); return }
    setPoMsg('Supplier selected. Implement /api/pos/create to finalize PO.')
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">New Purchase Order</h1>
      <div className="rounded border p-4 shadow-soft">
        <div className="mb-2 text-sm text-neutral-600">Pick supplier:</div>
        <input className="mb-2 w-full rounded border px-3 py-2" placeholder="Search suppliers…" value={q} onChange={e=>setQ(e.target.value)} />
        <div className="max-h-64 overflow-auto rounded border">
          {filtered.map(s => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 last:border-b-0">
              <input type="radio" name="supplier" value={s.id} checked={supplierId===s.id} onChange={()=>setSupplierId(s.id)} />
              <span className="text-sm">{s.name} <span className="text-neutral-500">({s.phone})</span></span>
            </label>
          ))}
          {!filtered.length && <div className="px-3 py-2 text-sm text-neutral-500">No suppliers found.</div>}
        </div>
        <button onClick={createPO} className="mt-3 rounded bg-brand px-3 py-2 text-white">Continue</button>
        {poMsg && <p className="mt-2 text-sm">{poMsg}</p>}
      </div>
    </main>
  )
}
