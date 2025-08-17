export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    const org_id = await ensureOrgContext(userId)
    if (!org_id && shape.suppliers.cols.org_id) {
      return NextResponse.json({ suppliers: [], warning: 'No organization context' })
    }

    let q = svc.from(shape.suppliers.table).select('*').order('created_at', { ascending: false })
    if (shape.suppliers.cols.org_id && org_id) q = q.eq('org_id', org_id)
    else if (!shape.suppliers.cols.org_id && shape.suppliers.cols.created_by) q = q.eq('created_by', userId)

    const { data, error } = await q
    if (error) throw error

    const list = (data || []).map((r: any) => ({
      id: r.id,
      name: r.name ?? r.supplier_name ?? '',
      phone: r.phone_e164 ?? r.phone ?? '',
      preferred_language: r.preferred_language ?? r.language ?? r.lang ?? null,
      updated_at: r.updated_at ?? r.created_at ?? null,
    }))

    return NextResponse.json({ suppliers: list })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load suppliers' }, { status: 500 })
  }
}
