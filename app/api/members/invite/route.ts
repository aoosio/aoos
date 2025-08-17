export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { email, role } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const svc = getServiceClient()
    const shape = await getDbShape()

    // Figure user's org (first active membership)
    const { data: mem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', userId)
      .order('org_id', { ascending: true })
      .limit(1)
      .maybeSingle()
    const org_id = mem?.org_id
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    // Send Supabase invite
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined
    const { data: invited, error: invErr } = await svc.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (invErr) throw invErr

    // Record membership (pending)
    const m: any = { org_id }
    if (shape.members.cols.user_id) m.user_id = invited.user?.id ?? null
    if (shape.members.cols.email) m.email = email
    if (shape.members.cols.role) m.role = role || 'PO_MANAGER'
    if (shape.members.cols.is_active) m.is_active = false
    if (shape.members.cols.status) m.status = 'INVITED'

    await svc.from(shape.members.table).insert(m)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to invite' }, { status: 500 })
  }
}
