export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    const { data: myMem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    const org_id = myMem?.org_id
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const text = await file.text()
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const [header, ...rows] = lines
    const cols = header.split(',').map(s => s.trim().toLowerCase())
    const get = (n: string) => cols.indexOf(n)

    const pi = get('product')
    const qi = get('qty')
    if (pi === -1 || qi === -1) {
      return NextResponse.json({ error: 'CSV must include product,qty' }, { status: 400 })
    }
    const ei = get('expiry_date')
    const di = get('distributor')
    const dpi = get('distributor_phone')

    const payload = rows.slice(0, 5000).map(r => {
      const c = r.split(',')
      const rec: any = { product: c[pi]?.trim() || '', qty: Number(c[qi] ?? 0) }
      if (ei >= 0 && c[ei]) rec.expiry_date = c[ei]
      if (di >= 0) rec.distributor = c[di] || null
      if (dpi >= 0) rec.distributor_phone = c[dpi] || null
      if (shape.stock.cols.org_id) rec.org_id = org_id
      if (shape.stock.cols.uploaded_by) rec.uploaded_by = userId
      if (shape.stock.cols.created_by) rec.created_by = userId
      return rec
    }).filter(r => r.product && !Number.isNaN(r.qty))

    if (!payload.length) return NextResponse.json({ ok: true, inserted: 0 })
    const { error } = await svc.from(shape.stock.table).insert(payload)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: payload.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to upload stock' }, { status: 500 })
  }
}
