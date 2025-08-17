export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext, getRoles } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { org_role, is_platform_owner, is_platform_admin } = await getRoles(userId)
    if (!is_platform_owner && !is_platform_admin && org_role !== 'OWNER' && org_role !== 'ORG_ADMIN') {
      return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 })
    }

    const { email, role } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    // Only allow ORG_ADMIN or PO_MANAGER invites at org-level
    const allowedRoles = ['ORG_ADMIN','PO_MANAGER']
    const safeRole = allowedRoles.includes(role) ? role : 'PO_MANAGER'

    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(userId)
    if (!org_id) return NextResponse.json({ error: 'Create an organization first' }, { status: 400 })

    // Supabase invite email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined
    const { data: invited, error: invErr } = await svc.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (invErr) throw invErr

    const invitedUserId = invited?.user?.id ?? null

    // Prefer invites table if present
    if (shape.invites) {
      const row: any = { org_id, email, role: safeRole, status: 'INVITED', invited_by: userId }
      if (shape.invites.cols.user_id && invitedUserId) row.user_id = invitedUserId
      await svc.from(shape.invites.table).insert(row)
    } else if (shape.members.cols.email && shape.members.cols.status) {
      // Fallback: store pending in members table (email + status)
      const m: any = { org_id, role: safeRole, is_active: false, status: 'INVITED' }
      if (shape.members.cols.email) m.email = email
      if (shape.members.cols.user_id && invitedUserId) m.user_id = invitedUserId
      await svc.from(shape.members.table).insert(m)
    } else if (shape.members.cols.user_id && invitedUserId) {
      // Last resort: if we received a user_id, create inactive membership
      const m: any = { org_id, user_id: invitedUserId }
      if (shape.members.cols.role) m.role = safeRole
      if (shape.members.cols.is_active) m.is_active = false
      if (shape.members.cols.status) m.status = 'INVITED'
      await svc.from(shape.members.table).insert(m)
    } // else: nothing to store locally; user will appear after first login.

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to invite' }, { status: 500 })
  }
}
