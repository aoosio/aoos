// app/api/members/invite/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const userClient = getUserClient()
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { email, org_id, role } = await req.json()
    if (!email || !org_id) {
      return NextResponse.json({ error: 'email and org_id are required' }, { status: 400 })
    }

    const supa = getServiceClient()

    // 1) Send Supabase Auth invite
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined
    const { data: invite, error: invErr } = await supa.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (invErr) throw invErr

    // 2) Optionally pre-create membership (status = invited)
    // If you have a 'status' column or invite table, adjust accordingly.
    await supa
      .from('organization_members')
      .insert({
        org_id,
        user_id: invite.user?.id ?? null, // may be null until user accepts
        email,
        role: role || 'PO_MANAGER',
        status: 'INVITED',
        invited_by: user.id,
      })
      .select('org_id')
      .maybeSingle()

    // 3) Audit
    await supa.from('audit_log').insert({
      actor_id: user.id,
      action: 'MEMBER_INVITE',
      entity: 'organization_members',
      entity_id: org_id,
      details: { email, role: role || 'PO_MANAGER' },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to invite' }, { status: 500 })
  }
}
