export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { name, phone, preferred_language } = await req.json()
    if (!name || !phone) return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    const org_id = await ensureOrgContext(userId)
    if (!org_id && shape.suppliers.cols.org_id) {
      return NextResponse.json({ error: 'No organization. Create or join one first.' }, { status: 400 })
    }

    const rec: any = {}
    if (shape.suppliers.cols.name) rec.name = String(name).trim()
    else if (shape.suppliers.cols.supplier_name) rec.supplier_name = String(name).trim()
    else return NextResponse.json({ error: 'No suitable name column found' }, { status: 500 })

    if (shape.suppliers.cols.phone_e164) rec.phone_e164 = String(phone).trim()
    else if (shape.suppliers.cols.phone) rec.phone = String(phone).trim()
    else return NextResponse.json({ error: 'No suitable phone column found' }, { status: 500 })

    const lang = preferred_language || 'en'
    if (shape.suppliers.cols.preferred_language) rec.preferred_language = lang
    else if (shape.suppliers.cols.language) rec.language = lang
    else if (shape.suppliers.cols.lang) rec.lang = lang

    if (shape.suppliers.cols.org_id && org_id) rec.org_id = org_id
    if (shape.suppliers.cols.created_by) rec.created_by = userId
    if (shape.suppliers.cols.is_active) rec.is_active = true

    const { data, error } = await svc.from(shape.suppliers.table).insert(rec).select('id').single()
    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to add supplier' }, { status: 500 })
  }
}
