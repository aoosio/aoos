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
    if (!org_id) return NextResponse.json({ members: [], invites: [] })

    // Active/created memberships
    const { data: mems, error: mErr } = await svc
      .from(shape.members.table)
      .select('user_id, role, is_active, status, created_at, email')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false })
    if (mErr) throw mErr

    // Pending invites (if invites table exists)
    let invites: any[] = []
    if (shape.invites) {
      const { data, error } = await svc
        .from(shape.invites.table)
        .select('user_id, email, role, status, created_at')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      invites = data || []
    } else {
      // derive "invites" from members rows with status INVITED and possibly email column
      invites = (mems || []).filter((m: any) => (m.status || '').toUpperCase() === 'INVITED')
    }

    // hydrate emails via admin for known user ids missing email
    const ids = (mems || []).map((m: any) => m.user_id).filter(Boolean)
    const emailMap: Record<string, string> = {}
    await Promise.all(
      ids.map(async (id: string) => {
        try {
          const { data: u } = await svc.auth.admin.getUserById(id)
          if (u?.user?.email) emailMap[id] = u.user.email
        } catch {}
      })
    )

    const members = (mems || []).map((m: any) => ({
      user_id: m.user_id,
      email: m.email || (m.user_id ? emailMap[m.user_id] || null : null),
      role: m.role || null,
      is_active: m.is_active ?? true,
      status: m.status || (m.is_active === false ? 'INVITED' : 'ACTIVE'),
      created_at: m.created_at || null,
    }))

    const pending = (invites || []).map((i: any) => ({
      user_id: i.user_id || null,
      email: i.email || (i.user_id ? emailMap[i.user_id] || null : null),
      role: i.role || 'PO_MANAGER',
      is_active: false,
      status: i.status || 'INVITED',
      created_at: i.created_at || null,
    }))

    // Merge: pending first, then members (filter out duplicates by email+user_id)
    const seen = new Set<string>()
    const result = [...pending, ...members].filter((r) => {
      const key = `${r.user_id || ''}:${r.email || ''}:${r.role || ''}:${r.status || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ members: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to list members' }, { status: 500 })
  }
}
