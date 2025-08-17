// app/api/members/remove/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient } from '@/lib/supabase-server'
import { requireOrgRole } from '@/lib/rbac'

export async function POST(req: Request) {
  try {
    const { org_id, user_id } = await req.json() as { org_id?: string; user_id?: string }
    if (!org_id || !user_id) return new Response('org_id and user_id are required', { status: 400 })

    // Only owners can remove members
    await requireOrgRole(org_id, ['OWNER'])

    const supabase = getUserClient()

    // Prevent removing the owner
    const { data: target, error: tErr } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', org_id)
      .eq('user_id', user_id)
      .maybeSingle()
    if (tErr) return new Response(tErr.message, { status: 400 })
    if (!target) return new Response('Member not found', { status: 404 })
    if (String(target.role).toUpperCase() === 'OWNER')
      return new Response('Cannot remove the Owner', { status: 400 })

    const { error } = await supabase.from('org_members').delete().match({ org_id, user_id })
    if (error) return new Response(error.message, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return new Response(e.message || 'Failed to remove member', { status: 500 })
  }
}
