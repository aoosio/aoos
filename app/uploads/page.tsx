'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function parseCSV(text: string): string[][] {
  // simple CSV with quotes support (no multiline)
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else { inQuotes = false }
      } else {
        cell += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { row.push(cell); cell = '' }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
      else if (ch !== '\r') { cell += ch }
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(c => c.trim() !== ''))
}

function headerMap(header: string[], expected: string[]) {
  const lower = header.map(h => h.trim().toLowerCase())
  const map: Record<string, number> = {}
  for (const col of expected) {
    const idx = lower.indexOf(col.toLowerCase())
    if (idx === -1) throw new Error(`Missing column "${col}"`)
    map[col] = idx
  }
  return map
}

function toISODate(s: string | undefined) {
  if (!s) return null
  const t = s.trim()
  if (!t) return null
  // Accept YYYY-MM-DD or DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return null
}

export default function UploadsPage() {
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [salesMsg, setSalesMsg] = useState<string | null>(null)
  const [stockMsg, setStockMsg] = useState<string | null>(null)
  const [salesBusy, setSalesBusy] = useState(false)
  const [stockBusy, setStockBusy] = useState(false)

  async function uploadSales() {
    if (!salesFile) { setSalesMsg('Choose a CSV first.'); return }
    setSalesBusy(true); setSalesMsg(null)
    try {
      const text = await salesFile.text()
      const rows = parseCSV(text)
      if (!rows.length) throw new Error('Empty CSV')
      const map = headerMap(rows[0], ['product', 'sold_qty'])
      const data = rows.slice(1).map(r => ({
        product: (r[map['product']] ?? '').trim(),
        sold_qty: Number((r[map['sold_qty']] ?? '0').toString().trim() || '0')
      })).filter(x => x.product)
      if (!data.length) throw new Error('No valid rows found')
      // Insert in chunks to avoid payload limits
      for (let i = 0; i < data.length; i += 1000) {
        const chunk = data.slice(i, i + 1000)
        const { error } = await supabase.from('sales_uploads').insert(chunk, { returning: 'minimal' })
        if (error) throw error
      }
      setSalesMsg(`Uploaded ${data.length} sales rows.`)
    } catch (e: any) {
      setSalesMsg(e.message || 'Upload failed')
    } finally {
      setSalesBusy(false)
    }
  }

  async function uploadStock() {
    if (!stockFile) { setStockMsg('Choose a CSV first.'); return }
    setStockBusy(true); setStockMsg(null)
    try {
      const text = await stockFile.text()
      const rows = parseCSV(text)
      if (!rows.length) throw new Error('Empty CSV')
      const map = headerMap(rows[0], ['product', 'qty', 'expiry_date', 'distributor', 'distributor_phone'])
      const data = rows.slice(1).map(r => ({
        product: (r[map['product']] ?? '').trim(),
        qty: Number((r[map['qty']] ?? '0').toString().trim() || '0'),
        expiry_date: toISODate(r[map['expiry_date']]),
        distributor: (r[map['distributor']] ?? '').trim() || null,
        distributor_phone: (r[map['distributor_phone']] ?? '').trim() || null
      })).filter(x => x.product)
      if (!data.length) throw new Error('No valid rows found')
      for (let i = 0; i < data.length; i += 1000) {
        const chunk = data.slice(i, i + 1000)
        const { error } = await supabase.from('stock_uploads').insert(chunk, { returning: 'minimal' })
        if (error) throw error
      }
      setStockMsg(`Uploaded ${data.length} stock rows.`)
    } catch (e: any) {
      setStockMsg(e.message || 'Upload failed')
    } finally {
      setStockBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">Uploads</h1>

        {/* Sales upload */}
        <div className="grid gap-3 sm:grid-cols-3 items-end">
          <div className="sm:col-span-2">
            <Label>Sales CSV</Label>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => setSalesFile(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-slate-500">
              Columns: <code>product,sold_qty</code>. <a className="underline" href="/AOOS_Sales_Template.csv">Download template</a>
            </p>
          </div>
          <div>
            <Button onClick={uploadSales} disabled={salesBusy || !salesFile}>{salesBusy ? 'Uploading…' : 'Upload sales'}</Button>
          </div>
          {salesMsg && <div className="sm:col-span-3 text-sm text-slate-700">{salesMsg}</div>}
        </div>

        <hr className="my-6" />

        {/* Stock upload */}
        <div className="grid gap-3 sm:grid-cols-3 items-end">
          <div className="sm:col-span-2">
            <Label>Stock CSV</Label>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => setStockFile(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-slate-500">
              Columns: <code>product,qty,expiry_date,distributor,distributor_phone</code>. <a className="underline" href="/AOOS_Stock_Template.csv">Download template</a>
            </p>
          </div>
          <div>
            <Button onClick={uploadStock} disabled={stockBusy || !stockFile}>{stockBusy ? 'Uploading…' : 'Upload stock'}</Button>
          </div>
          {stockMsg && <div className="sm:col-span-3 text-sm text-slate-700">{stockMsg}</div>}
        </div>
      </Card>
    </div>
  )
}
