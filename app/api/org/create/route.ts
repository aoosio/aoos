// app/api/org/create/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const userClient = getUserClient()
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()
    if (userErr) throw userErr
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const {
      name,
      org_type_main,
      org_type_sub,
      country,
      state,
      phone,
    } = body || {}

    if (!name || !org_type_main) {
      return NextResponse.json({ error: 'name and org_type_main are required' }, { status: 400 })
    }

    const supa = getServiceClient()

    // 1) Create organization
    const { data: org, error: orgErr } = await supa
      .from('organizations')
      .insert({
        name,
        org_type_main,
        org_type_sub: org_type_sub ?? null,
        country: country ?? null,
        state: state ?? null,
        phone: phone ?? null,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (orgErr) throw orgErr

    // 2) Ensure membership for creator
    // If your table is named differently, adjust here:
    // organization_members(org_id uuid, user_id uuid, role text/enum)
    await supa
      .from('organization_members')
      .upsert({ org_id: org.id, user_id: user.id, role: 'ORG_OWNER' })
      .select('org_id')
      .single()

    // 3) Optional audit
    await supa.from('audit_log').insert({
      actor_id: user.id,
      action: 'ORG_CREATE',
      entity: 'organizations',
      entity_id: org.id,
      details: { name, org_type_main, org_type_sub, country, state, phone },
    })

    return NextResponse.json({ ok: true, org_id: org.id })
  } catch (e: any) {
    const msg = e?.message || 'Failed to create organization'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
