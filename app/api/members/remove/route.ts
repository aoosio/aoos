export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext, getRoles } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    const { org_role } = await getRoles(userId)
    if (org_role !== 'OWNER') return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 })

    const { user_id } = await req.json()
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(userId)
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const { error } = await svc.from(shape.members.table).delete().match({ org_id, user_id })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to remove' }, { status: 500 })
  }
}
