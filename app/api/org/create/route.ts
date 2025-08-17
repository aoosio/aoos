export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const { name, org_type_main, org_type_sub, country, state, phone } = await req.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid organization name' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !service) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
    }

    const supa = createClient(url, service)

    // 1) Create org (capture privacy consent)
    const { data: org, error: e1 } = await supa
      .from('organizations')
      .insert({
        name,
        org_type_main,
        org_type_sub,
        country,
        state,
        phone,
        privacy_agreed_at: new Date().toISOString(),
        privacy_agreed_by: userId,
      })
      .select('id')
      .single()
    if (e1) throw e1

    // 2) Owner membership
    const { error: e2 } = await supa
      .from('members')
      .insert({ org_id: org.id, user_id: userId, role: 'OWNER' })
    if (e2) throw e2

    // 3) Default subscription row
    await supa
      .from('organization_subscriptions')
      .insert({ org_id: org.id, status: 'active' })
      .select()
      .single()

    return NextResponse.json({ ok: true, org_id: org.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
