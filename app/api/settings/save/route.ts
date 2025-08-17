export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient } from '@/lib/supabase-server'
import { requireOrgRole } from '@/lib/rbac'
import { getDbShape } from '@/lib/db-adapter'

function splitIndustry(code?: string | null) {
  if (!code) return { main: null, sub: null }
  const parts = String(code).trim().split('_')
  return { main: parts[0] || null, sub: parts.slice(1).join('_') || null }
}

async function resolveOrgId(supabase: ReturnType<typeof getUserClient>, org_id?: string | null) {
  if (org_id) return org_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: mem } = await supabase.from('org_members')
    .select('org_id').eq('user_id', user.id).eq('is_active', true)
    .order('org_id', { ascending: true }).limit(1).maybeSingle()
  return mem?.org_id ?? null
}

export async function POST(req: Request) {
  try {
    const { org_id: rawOrg, org } = await req.json()
    const supabase = getUserClient()
    const org_id = await resolveOrgId(supabase, rawOrg)
    if (!org_id) return NextResponse.json({ error: 'No organization found' }, { status: 400 })

    await requireOrgRole(org_id, ['OWNER'])

    const shape = await getDbShape()
    const src = (org && typeof org === 'object') ? org : {}
    const upd: any = {}

    if (shape.orgs.cols.name && src.name !== undefined) upd.name = String(src.name).trim()

    const code = src.industry_type ?? src.org_type ?? src.type ?? null
    const { main, sub } = splitIndustry(code)
    if (shape.orgs.cols.industry_type && code) upd.industry_type = code
    if (shape.orgs.cols.org_type && code)      upd.org_type = code
    if (shape.orgs.cols.type && code)          upd.type = code
    if (shape.orgs.cols.org_type_main && main) upd.org_type_main = main
    if (shape.orgs.cols.org_type_sub && sub)   upd.org_type_sub  = sub

    if (shape.orgs.cols.country && src.country !== undefined) upd.country = src.country
    if (shape.orgs.cols.state && src.state !== undefined)     upd.state = src.state
    if (shape.orgs.cols.phone && src.phone !== undefined)     upd.phone = String(src.phone).trim()
    if (shape.orgs.cols.default_language && src.default_language !== undefined) upd.default_language = src.default_language
    if (shape.orgs.cols.ssi_days && src.ssi_days !== undefined) upd.ssi_days = Number(src.ssi_days)
    if (shape.orgs.cols.sla_target_days && src.sla_target_days !== undefined) upd.sla_target_days = Number(src.sla_target_days)
    if (shape.orgs.cols.default_dial_code && src.default_dial_code !== undefined) upd.default_dial_code = String(src.default_dial_code)

    if (!Object.keys(upd).length) return NextResponse.json({ ok: true, changed: 0 })
    const { error } = await supabase.from(shape.orgs.table).update(upd).eq('id', org_id)
    if (error) throw error
    return NextResponse.json({ ok: true, changed: 1 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to save settings' }, { status: 500 })
  }
}
