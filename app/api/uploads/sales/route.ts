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

    // Caller org
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
    const pi = cols.indexOf('product')
    const qi = cols.indexOf('sold_qty')
    if (pi === -1 || qi === -1) {
      return NextResponse.json({ error: 'CSV must include product,sold_qty' }, { status: 400 })
    }

    const payload = rows.slice(0, 5000).map(r => {
      const c = r.split(',')
      const rec: any = { product: c[pi]?.trim() || '', sold_qty: Number(c[qi] ?? 0) }
      if (shape.sales.cols.org_id) rec.org_id = org_id
      if (shape.sales.cols.uploaded_by) rec.uploaded_by = userId
      if (shape.sales.cols.created_by) rec.created_by = userId
      return rec
    }).filter(r => r.product && !Number.isNaN(r.sold_qty))

    if (!payload.length) return NextResponse.json({ ok: true, inserted: 0 })
    const { error } = await svc.from(shape.sales.table).insert(payload)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: payload.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to upload sales' }, { status: 500 })
  }
}
