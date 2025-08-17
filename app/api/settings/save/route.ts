export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'
import { encryptToken, maskToken } from '@/lib/crypto'

function splitIndustry(code?: string | null) {
  if (!code) return { main: null, sub: null }
  const parts = String(code).trim().split('_')
  return { main: parts[0] || null, sub: parts.slice(1).join('_') || null }
}

export async function POST(req: Request) {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(uid)
    if (!org_id) return NextResponse.json({ error: 'No organization. Create or join one first.' }, { status: 400 })

    const body = await req.json()

    // ---- ORG ----
    if (body.org && typeof body.org === 'object') {
      const src = body.org
      const upd: any = {}

      if (shape.orgs.cols.name && src.name !== undefined) upd.name = String(src.name).trim()

      // combined & split shapes
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

      if (Object.keys(upd).length > 0) {
        const { error } = await svc.from(shape.orgs.table).update(upd).eq('id', org_id)
        if (error) throw error
      }
    }

    // ---- WHATSAPP ----
    if (body.whatsapp && typeof body.whatsapp === 'object') {
      const src = body.whatsapp
      const row: any = { org_id }

      if (shape.waChannel.cols.phone_number_id && src.phone_number_id !== undefined) {
        row.phone_number_id = String(src.phone_number_id).trim()
      }
      if (shape.waChannel.cols.waba_id && src.waba_id !== undefined) {
        row.waba_id = String(src.waba_id).trim()
      }

      if (src.access_token !== undefined && src.access_token !== null && String(src.access_token).trim() !== '') {
        const blob = encryptToken(String(src.access_token))
        if (shape.waChannel.cols.token_encrypted) row.token_encrypted = blob
        const { masked, hint } = maskToken(String(src.access_token))
        if (shape.waChannel.cols.token_masked) row.token_masked = masked
        if (shape.waChannel.cols.token_hint)   row.token_hint   = hint
      }

      const { error } = await svc.from(shape.waChannel.table).upsert(row, { onConflict: 'org_id' })
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to save settings' }, { status: 500 })
  }
}
