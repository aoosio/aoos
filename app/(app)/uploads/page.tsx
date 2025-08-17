'use client'
import { useState } from 'react'

export default function Uploads() {
  const [salesMsg, setSalesMsg] = useState<string | null>(null)
  const [stockMsg, setStockMsg] = useState<string | null>(null)

  async function upload(kind: 'sales' | 'stock', file?: File | null) {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/uploads/${kind}`, { method: 'POST', body: fd })
    const j = await res.json().catch(()=>({}))
    if (!res.ok) throw new Error(j?.error || 'Upload failed')
    return j
  }

  return (
    <main className="space-y-8">
      <section className="rounded border p-4 shadow-soft">
        <h2 className="font-semibold">Sales CSV</h2>
        <p className="text-sm text-neutral-600">
          I accept any of: <code>product/sku/barcode</code> + <code>sold_qty/sales/sold/quantity/qty</code>.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block"
          onChange={async (e) => {
            setSalesMsg(null)
            try {
              const j = await upload('sales', e.target.files?.[0] || null)
              setSalesMsg(`Inserted ${j.inserted} rows into ${j.table}.`)
            } catch (err: any) { setSalesMsg(err.message) }
          }}
        />
        {salesMsg && <p className="mt-2 text-sm">{salesMsg}</p>}
      </section>

      <section className="rounded border p-4 shadow-soft">
        <h2 className="font-semibold">Stock CSV</h2>
        <p className="text-sm text-neutral-600">
          I accept any of: <code>product/sku/barcode</code> + <code>qty/quantity</code> (+ optional expiry/distributor/phone).
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block"
          onChange={async (e) => {
            setStockMsg(null)
            try {
              const j = await upload('stock', e.target.files?.[0] || null)
              setStockMsg(`Inserted ${j.inserted} rows into ${j.table}.`)
            } catch (err: any) { setStockMsg(err.message) }
          }}
        />
        {stockMsg && <p className="mt-2 text-sm">{stockMsg}</p>}
      </section>
    </main>
  )
}
