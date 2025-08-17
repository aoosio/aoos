// app/api/org/create/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

/** Treat Postgres + PostgREST “missing column” variants as ignorable */
function isMissingColumnErr(err: any) {
  const code = String(err?.code || '').toUpperCase()
  const msg = String(err?.message || '').toLowerCase()
  return (
    code === '42703' ||
    code.startsWith('PGRST') ||
    /schema cache/.test(msg) ||
    /could not find.*column/.test(msg) ||
    /column .* does not exist/.test(msg)
  )
}

/** Split a combined industry code like "FMCG_CHAIN" to main/sub */
function splitIndustry(code?: string | null) {
  if (!code) return { main: null, sub: null }
  const parts = String(code).trim().split('_')
  return { main: parts[0] || null, sub: parts.slice(1).join('_') || null }
}

export async function POST(req: Request) {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const payload = await req.json().catch(() => ({}))
    const name = (payload?.name ?? '').toString().trim()
    const industry_type = payload?.industry_type ?? null
    const country = payload?.country ?? null
    const state = payload?.state ?? null
    const phone = payload?.phone ?? null
    const default_language = payload?.default_language ?? null

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const svc = getServiceClient()
    const shape = await getDbShape()

    // If the user already has a membership, return that org (prevents duplicates)
    const { data: existingMem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle()

    if (existingMem?.org_id) {
      return NextResponse.json({ ok: true, org_id: existingMem.org_id, existed: true })
    }

    // 1) Insert minimal org row (avoid optional columns that may not exist)
    const orgInsert: any = {}
    if (shape.orgs.cols.name) orgInsert.name = name
    if (shape.orgs.cols.created_by) orgInsert.created_by = uid

    const ins = await svc.from(shape.orgs.table).insert(orgInsert).select('id').single()
    if (ins.error) throw ins.error
    const org_id = ins.data.id as string

    // 2) Update optional fields ONE BY ONE, ignore "missing column" errors safely
    const updates: Record<string, any> = {}

    // Combined code and split parts
    const { main, sub } = splitIndustry(industry_type)
    if (industry_type) {
      if (shape.orgs.cols.industry_type) updates.industry_type = industry_type
      if (shape.orgs.cols.org_type)      updates.org_type      = industry_type
      if (shape.orgs.cols.type)          updates.type          = industry_type
    }
    if (main && shape.orgs.cols.org_type_main) updates.org_type_main = main
    if (sub  && shape.orgs.cols.org_type_sub)  updates.org_type_sub  = sub

    if (country && shape.orgs.cols.country)                 updates.country = country
    if (state && shape.orgs.cols.state)                     updates.state = state
    if (phone && shape.orgs.cols.phone)                     updates.phone = String(phone).trim()
    if (default_language && shape.orgs.cols.default_language) updates.default_language = default_language

    // Optional numeric org settings if the UI later sends them
    if (payload?.ssi_days != null && shape.orgs.cols.ssi_days) {
      const n = Number(payload.ssi_days)
      if (Number.isFinite(n)) updates.ssi_days = n
    }
    if (payload?.sla_target_days != null && shape.orgs.cols.sla_target_days) {
      const n = Number(payload.sla_target_days)
      if (Number.isFinite(n)) updates.sla_target_days = n
    }
    if (payload?.default_dial_code != null && shape.orgs.cols.default_dial_code) {
      updates.default_dial_code = String(payload.default_dial_code)
    }

    // Apply each column separately to avoid one bad column breaking the rest
    for (const [col, val] of Object.entries(updates)) {
      const { error } = await svc.from(shape.orgs.table).update({ [col]: val }).eq('id', org_id)
      if (error && !isMissingColumnErr(error)) {
        // rollback org if something unexpected fails
        await svc.from(shape.orgs.table).delete().eq('id', org_id)
        throw error
      }
    }

    // 3) Bind membership as OWNER
    const mem: any = { org_id, user_id: uid }
    if (shape.members.cols.role) mem.role = 'OWNER'
    if (shape.members.cols.is_active) mem.is_active = true
    if (shape.members.cols.status) mem.status = 'ACTIVE'

    const memIns = await svc.from(shape.members.table).insert(mem)
    if (memIns.error) {
      // Clean up org if membership insert fails
      await svc.from(shape.orgs.table).delete().eq('id', org_id)
      throw memIns.error
    }

    return NextResponse.json({ ok: true, org_id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create organization' }, { status: 500 })
  }
}
