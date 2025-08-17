// app/api/uploads/sales/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'
import { parseCSV, pick } from '@/lib/csv'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })
    const text = await file.text()
    const { headers, rows } = parseCSV(text)
    if (!headers.length) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    // ✅ Resolve/ensure org context (auto-link owner to their org if needed)
    const org_id = await ensureOrgContext(userId)
    if (shape.sales.cols.org_id && !org_id) {
      return NextResponse.json({ error: 'No organization. Create or join one first.' }, { status: 400 })
    }

    // Column indices (with synonyms)
    const prodIdx = pick(headers, ['product','sku','barcode','name','item','code'])
    const soldIdx = pick(headers, ['sold_qty','sales','sold','quantity','qty','qty_sold'])
    if (prodIdx < 0 || soldIdx < 0) {
      return NextResponse.json({
        error:
`CSV must include product and sold quantity columns. Looked for any of:
product: product, sku, barcode, name, item, code
sold: sold_qty, sales, sold, quantity, qty, qty_sold`
      }, { status: 400 })
    }

    // Optional: batch id if table supports it
    let batch_id: string | null = null
    if (shape.sales.cols.batch_id) {
      const { data } = await svc.rpc('gen_random_uuid' as any)
      batch_id = data ?? null
    }

    const payload: any[] = []
    for (const r of rows) {
      const product = (r[prodIdx] || '').toString().trim()
      if (!product) continue
      const soldRaw = Number((r[soldIdx] ?? '0').toString().replace(/[^0-9.\-]/g, ''))
      const sold_qty = Number.isFinite(soldRaw) ? soldRaw : 0

      const rec: any = {}
      // product-esque column
      if (shape.sales.cols.product) rec.product = product
      else if (shape.sales.cols.sku) rec.sku = product
      else if (shape.sales.cols.barcode) rec.barcode = product
      else rec.product = product // fallback

      // quantity column
      if (shape.sales.cols.sold_qty) rec.sold_qty = sold_qty
      else if (shape.sales.cols.quantity) rec.quantity = sold_qty
      else if (shape.sales.cols.qty) rec.qty = sold_qty
      else rec.sold_qty = sold_qty // fallback

      if (shape.sales.cols.org_id && org_id) rec.org_id = org_id
      if (shape.sales.cols.uploaded_by) rec.uploaded_by = userId
      if (shape.sales.cols.created_by) rec.created_by = userId
      if (shape.sales.cols.batch_id && batch_id) rec.batch_id = batch_id
      if (shape.sales.cols.status) rec.status = 'NEW'

      payload.push(rec)
      if (payload.length >= 10000) break
    }

    if (!payload.length) return NextResponse.json({ error: 'No valid rows' }, { status: 400 })

    const { error } = await svc.from(shape.sales.table).insert(payload)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: payload.length, table: shape.sales.table })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to upload sales' }, { status: 500 })
  }
}
