export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const { name } = body || {}
    if (!name || !String(name).trim())
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    // Insert organization (with created_by if column exists)
    const orgPayload: any = { name: String(name).trim() }
    if (shape.orgs.cols.created_by) orgPayload.created_by = userId

    const { data: org, error: oErr } = await svc
      .from(shape.orgs.table)
      .insert(orgPayload)
      .select('id')
      .single()
    if (oErr) throw oErr

    // Add membership as OWNER (use available columns)
    const memPayload: any = { org_id: org.id, user_id: userId }
    if (shape.members.cols.role) memPayload.role = 'OWNER'
    if (shape.members.cols.is_active) memPayload.is_active = true
    if (shape.members.cols.status) memPayload.status = 'ACTIVE'

    await svc.from(shape.members.table).insert(memPayload)

    return NextResponse.json({ ok: true, org_id: org.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create organization' }, { status: 500 })
  }
}
