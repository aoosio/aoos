// app/api/uploads/sales/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient } from '@/lib/supabase-server'
import { requireOrgRole } from '@/lib/rbac'
import { getDbShape } from '@/lib/db-adapter'
import { parseCSV, pick } from '@/lib/csv'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const supabase = getUserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    // Resolve org (first active membership)
    const { data: mem } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('org_id', { ascending: true })
      .limit(1)
      .maybeSingle()
    const org_id = mem?.org_id as string | undefined
    if (!org_id) return NextResponse.json({ error: 'Join or create an organization first.' }, { status: 400 })

    // Role gate
    await requireOrgRole(org_id, ['OWNER','ADMIN','PO_MANAGER'])

    const text = await file.text()
    const { headers, rows } = parseCSV(text)
    if (!headers.length) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 })

    const shape = await getDbShape()

    const prodIdx = pick(headers, ['product','sku','barcode','name','item','code'])
    const soldIdx = pick(headers, ['sold_qty','sales','sold','quantity','qty','qty_sold'])
    if (prodIdx < 0 || soldIdx < 0) {
      return NextResponse.json({ error:
`CSV must include product and sold quantity columns.
product: product, sku, barcode, name, item, code
sold: sold_qty, sales, sold, quantity, qty, qty_sold` }, { status: 400 })
    }

    let batch_id: string | null = null
    if (shape.sales.cols.batch_id) {
      const { data } = await supabase.rpc('gen_random_uuid' as any)
      batch_id = (data as any) ?? null
    }

    const payload: any[] = []
    for (const r of rows) {
      const product = (r[prodIdx] || '').toString().trim()
      if (!product) continue
      const soldRaw = Number((r[soldIdx] ?? '0').toString().replace(/[^0-9.\-]/g, ''))
      const sold_qty = Number.isFinite(soldRaw) ? soldRaw : 0

      const rec: any = {}
      if (shape.sales.cols.product) rec.product = product
      else if (shape.sales.cols.sku) rec.sku = product
      else if (shape.sales.cols.barcode) rec.barcode = product
      else rec.product = product

      if (shape.sales.cols.sold_qty) rec.sold_qty = sold_qty
      else if (shape.sales.cols.quantity) rec.quantity = sold_qty
      else if (shape.sales.cols.qty) rec.qty = sold_qty
      else rec.sold_qty = sold_qty

      if (shape.sales.cols.org_id) rec.org_id = org_id
      if (shape.sales.cols.uploaded_by) rec.uploaded_by = user.id
      if (shape.sales.cols.created_by) rec.created_by = user.id
      if (shape.sales.cols.batch_id && batch_id) rec.batch_id = batch_id
      if (shape.sales.cols.status) rec.status = 'NEW'

      payload.push(rec)
      if (payload.length >= 10000) break
    }

    if (!payload.length) return NextResponse.json({ error: 'No valid rows' }, { status: 400 })

    const { error } = await supabase.from(shape.sales.table).insert(payload)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: payload.length, table: shape.sales.table })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to upload sales' }, { status: 500 })
  }
}
