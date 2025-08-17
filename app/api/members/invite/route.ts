// app/api/members/invite/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient, getServiceClient } from '@/lib/supabase-server'
import { requireOrgRole } from '@/lib/rbac'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const { org_id, email, role } = await req.json()
    if (!org_id) return NextResponse.json({ error: 'org_id required' }, { status: 400 })
    if (!email)  return NextResponse.json({ error: 'email required' }, { status: 400 })

    // Only OWNER can invite (per policy)
    await requireOrgRole(org_id, ['OWNER'])

    const supabase = getUserClient()
    const shape = await getDbShape()

    // Allow only ADMIN or PO_MANAGER at org level
    const allowed = new Set(['ADMIN','PO_MANAGER'])
    const safeRole = allowed.has(String(role || '').toUpperCase()) ? String(role).toUpperCase() : 'PO_MANAGER'

    // Send invite email (requires service role)
    const svc = getServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined
    const { data: invited, error: invErr } = await svc.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (invErr) throw invErr
    const invitedUserId = invited?.user?.id ?? null

    // Optional: record invitation if invites table exists
    if (shape.invites) {
      const row: any = { org_id, email, role: safeRole, status: 'INVITED' }
      if (shape.invites.cols.user_id && invitedUserId) row.user_id = invitedUserId
      await supabase.from(shape.invites.table).insert(row)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to invite' }, { status: 500 })
  }
}
