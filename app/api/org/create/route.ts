// app/api/org/create/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { name, industry_type, country, state, phone, default_language } = await req.json()

    if (!name || String(name).trim().length < 2) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const svc = getServiceClient()
    const shape = await getDbShape()

    // تحضير سجل المؤسسة حسب الأعمدة الموجودة فعلياً
    const org: any = {}
    if (shape.orgs.cols.name) org.name = String(name).trim()
    if (shape.orgs.cols.created_by) org.created_by = uid

    const it = industry_type || null
    if (it) {
      if (shape.orgs.cols.industry_type) org.industry_type = it
      else if (shape.orgs.cols.org_type) org.org_type = it
      else if (shape.orgs.cols.type) org.type = it
    }
    if (country && shape.orgs.cols.country) org.country = country
    if (state && shape.orgs.cols.state) org.state = state
    if (phone && shape.orgs.cols.phone) org.phone = String(phone).trim()
    if (default_language && shape.orgs.cols.default_language) org.default_language = default_language

    // الإنشاء
    const { data: created, error: insErr } = await svc
      .from(shape.orgs.table)
      .insert(org)
      .select('id')
      .single()

    if (insErr) throw insErr
    const org_id = created.id

    // ربط العضوية كـ OWNER
    const mem: any = { org_id, user_id: uid }
    if (shape.members.cols.role) mem.role = 'OWNER'
    if (shape.members.cols.is_active) mem.is_active = true
    if (shape.members.cols.status) mem.status = 'ACTIVE'
    // إذا عندك عمود email بالميمبرز ممكن نخزّنه (إختياري)

    const { error: memErr } = await svc.from(shape.members.table).insert(mem)
    if (memErr) {
      // لو فشل الربط لأي سبب، احذف المؤسسة حتى ما تبقى孤 orphan
      await svc.from(shape.orgs.table).delete().eq('id', org_id)
      throw memErr
    }

    return NextResponse.json({ ok: true, org_id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create organization' }, { status: 500 })
  }
}
