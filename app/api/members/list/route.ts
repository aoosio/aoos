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

    // Get user's org
    const { data: myMem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    const org_id = myMem?.org_id
    if (!org_id) return NextResponse.json({ members: [] })

    const { data, error } = await svc
      .from(shape.members.table)
      .select('user_id, role, is_active, status, created_at, email')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false })
    if (error) throw error

    // hydrate emails via admin getUserById (auth.users may be hidden)
    const ids = (data || []).map((m: any) => m.user_id).filter(Boolean)
    const emailMap: Record<string, string> = {}
    await Promise.all(
      ids.map(async (id: string) => {
        try {
          const { data: u } = await svc.auth.admin.getUserById(id)
          if (u?.user?.email) emailMap[id] = u.user.email
        } catch {}
      })
    )

    const members = (data || []).map((m: any) => ({
      ...m,
      email: m.email || (m.user_id ? emailMap[m.user_id] || null : m.email || null),
    }))

    return NextResponse.json({ members })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to list members' }, { status: 500 })
  }
}
