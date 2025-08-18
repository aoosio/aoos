import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const payload = {
    name: String(body.name || '').trim(),
    industry_type: body.industry_type || null,
    country: body.country || null,
    state: body.state || null,
    phone: body.phone || null,
    default_language: body.default_language || 'en',
  }
  if (!payload.name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  // 1) أنشئ المنظمة
  const { data: org, error: orgErr } = await supabase
    .from('orgs')
    .insert(payload)
    .select()
    .single()
  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 400 })

  // 2) اجعل المستخدم الحالي OWNER
  const { error: memErr } = await supabase.from('org_members').insert({
    org_id: org.id, user_id: user.id, role: 'OWNER', status: 'ACTIVE'
  })
  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, org })
}
