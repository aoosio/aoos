// app/api/members/list/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getUserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    // resolve org
    const { data: mem } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('org_id', { ascending: true })
      .limit(1)
      .maybeSingle()
    const org_id = mem?.org_id as string | undefined
    if (!org_id) return NextResponse.json({ members: [], invites: [] })

    // members (RLS)
    const { data: members, error: mErr } = await supabase
      .from('org_members')
      .select('user_id,email,role,status,created_at')
      .eq('org_id', org_id)
      .order('created_at', { ascending: false })
    if (mErr) throw mErr

    // invites table is optional; ignore if missing
    let invites: any[] = []
    try {
      const res = await supabase
        .from('invites')
        .select('user_id,email,role,status,created_at')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false })
      invites = res.data || []
    } catch {}

    return NextResponse.json({ members: members || [], invites })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to list members' }, { status: 500 })
  }
}
