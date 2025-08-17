// app/api/settings/get/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function GET() {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(uid)

    let org: any = null
    if (org_id) {
      const { data } = await svc
        .from(shape.orgs.table)
        .select('*')
        .eq('id', org_id)
        .maybeSingle()
      org = data || null
    }

    let wa: any = null
    if (org_id) {
      const { data } = await svc
        .from(shape.waChannel.table)
        .select('*')
        .eq('org_id', org_id)
        .maybeSingle()
      if (data) {
        wa = {
          phone_number_id: data.phone_number_id ?? null,
          waba_id: data.waba_id ?? null,
          token_masked: data.token_masked ?? null,
          token_hint: data.token_hint ?? null,
          is_connected: data.is_connected ?? false,
        }
      }
    }

    // Normalize org fields safely (only those that exist)
    const normOrg = org && {
      id: org.id,
      name: ('name' in org) ? org.name : null,
      industry_type: org.industry_type ?? org.org_type ?? org.type ?? null,
      country: org.country ?? null,
      state: org.state ?? null,
      phone: org.phone ?? null,
      default_language: org.default_language ?? null,
      ssi_days: org.ssi_days ?? null,
      sla_target_days: org.sla_target_days ?? null,
      default_dial_code: org.default_dial_code ?? null,
    }

    return NextResponse.json({ org: normOrg, whatsapp: wa })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load settings' }, { status: 500 })
  }
}
