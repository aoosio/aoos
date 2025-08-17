// app/api/uploads/stock/route.ts
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

    await requireOrgRole(org_id, ['OWNER','ADMIN','PO_MANAGER'])

    const text = await file.text()
    const { headers, rows } = parseCSV(text)
    if (!headers.length) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 })

    const shape = await getDbShape()

    const prodIdx   = pick(headers, ['product','sku','barcode','name','item','code'])
    const qtyIdx    = pick(headers, ['qty','quantity','stock_qty'])
    const expiryIdx = pick(headers, ['expiry_date','expiry','exp_date','expire'])
    const distIdx   = pick(headers, ['distributor','supplier','vendor'])
    const phoneIdx  = pick(headers, ['distributor_phone','supplier_phone','vendor_phone','phone','phone_e164'])

    if (prodIdx < 0 || qtyIdx < 0) {
      return NextResponse.json({ error:
`CSV must include product and qty columns.
product: product, sku, barcode, name, item, code
qty: qty, quantity, stock_qty` }, { status: 400 })
    }

    let batch_id: string | null = null
    if (shape.stock.cols.batch_id) {
      const { data } = await supabase.rpc('gen_random_uuid' as any)
      batch_id = (data as any) ?? null
    }

    const payload: any[] = []
    for (const r of rows) {
      const product = (r[prodIdx] || '').toString().trim()
      if (!product) continue
      const qtyRaw = Number((r[qtyIdx] ?? '0').toString().replace(/[^0-9.\-]/g, ''))
      const qty = Number.isFinite(qtyRaw) ? qtyRaw : 0
      const expiry = expiryIdx >= 0 ? (r[expiryIdx] || '').toString().trim() : ''
      const distributor = distIdx >= 0 ? (r[distIdx] || '').toString().trim() : ''
      const dist_phone  = phoneIdx >= 0 ? (r[phoneIdx] || '').toString().trim() : ''

      const rec: any = {}
      if (shape.stock.cols.product) rec.product = product
      else if (shape.stock.cols.sku) rec.sku = product
      else if (shape.stock.cols.barcode) rec.barcode = product
      else rec.product = product

      if (shape.stock.cols.qty) rec.qty = qty
      else if (shape.stock.cols.quantity) rec.quantity = qty
      else rec.qty = qty

      if (expiry && (shape.stock.cols.expiry_date || shape.stock.cols.expiry || shape.stock.cols.exp_date)) {
        if (shape.stock.cols.expiry_date) rec.expiry_date = expiry
        else if (shape.stock.cols.expiry) rec.expiry = expiry
        else if (shape.stock.cols.exp_date) rec.exp_date = expiry
      }
      if (distributor && (shape.stock.cols.distributor || shape.stock.cols.supplier || shape.stock.cols.vendor)) {
        if (shape.stock.cols.distributor) rec.distributor = distributor
        else if (shape.stock.cols.supplier) rec.supplier = distributor
        else if (shape.stock.cols.vendor) rec.vendor = distributor
      }
      if (dist_phone && (shape.stock.cols.distributor_phone || shape.stock.cols.supplier_phone || shape.stock.cols.vendor_phone || shape.stock.cols.phone || shape.stock.cols.phone_e164)) {
        if (shape.stock.cols.distributor_phone) rec.distributor_phone = dist_phone
        else if (shape.stock.cols.supplier_phone) rec.supplier_phone = dist_phone
        else if (shape.stock.cols.vendor_phone) rec.vendor_phone = dist_phone
        else if (shape.stock.cols.phone_e164) rec.phone_e164 = dist_phone
        else if (shape.stock.cols.phone) rec.phone = dist_phone
      }

      if (shape.stock.cols.org_id) rec.org_id = org_id
      if (shape.stock.cols.uploaded_by) rec.uploaded_by = user.id
      if (shape.stock.cols.created_by) rec.created_by = user.id
      if (shape.stock.cols.batch_id && batch_id) rec.batch_id = batch_id
      if (shape.stock.cols.status) rec.status = 'NEW'

      payload.push(rec)
      if (payload.length >= 10000) break
    }

    if (!payload.length) return NextResponse.json({ error: 'No valid rows' }, { status: 400 })

    const { error } = await supabase.from(shape.stock.table).insert(payload)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: payload.length, table: shape.stock.table })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to upload stock' }, { status: 500 })
  }
}
