// app/api/suppliers/list/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    // Get caller org
    const { data: myMem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    const org_id = myMem?.org_id ?? null

    let query = svc.from(shape.suppliers.table).select('*').order('created_at', { ascending: false })
    if (shape.suppliers.cols.org_id && org_id) query = query.eq('org_id', org_id)
    else if (!shape.suppliers.cols.org_id && shape.suppliers.cols.created_by) query = query.eq('created_by', userId)

    const { data, error } = await query
    if (error) throw error

    // Normalize output for the UI
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
