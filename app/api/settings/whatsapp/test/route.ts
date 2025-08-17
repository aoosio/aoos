// app/api/settings/whatsapp/test/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'
import { decryptToken } from '@/lib/crypto'

const API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
const API_VER  = process.env.WHATSAPP_API_VERSION || 'v21.0'

export async function POST() {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(uid)
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    // read channel creds
    const { data: ch, error: chErr } = await svc
      .from(shape.waChannel.table)
      .select('phone_number_id, token_encrypted')
      .eq('org_id', org_id)
      .maybeSingle()
    if (chErr || !ch?.phone_number_id || !ch?.token_encrypted) {
      return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 400 })
    }

    const token = decryptToken(ch.token_encrypted)
    const phone_number_id = String(ch.phone_number_id)

    // simple metadata GET to validate token/number
    const r = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(phone_number_id)}?fields=display_phone_number`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const j = await r.json().catch(() => ({}))

    // mark connection status
    const patch: any = {}
    if (shape.waChannel.cols.last_test_at) patch.last_test_at = new Date().toISOString()
    if (shape.waChannel.cols.is_connected) patch.is_connected = r.ok
    if (shape.waChannel.cols.last_error)   patch.last_error   = r.ok ? null : (j?.error?.message || `HTTP ${r.status}`)
    if (Object.keys(patch).length) await svc.from(shape.waChannel.table).update(patch).eq('org_id', org_id)

    if (!r.ok) {
      return NextResponse.json({ ok: false, status: r.status, error: j?.error?.message || 'Graph error' }, { status: 200 })
    }

    return NextResponse.json({ ok: true, graph: j })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to test connection' }, { status: 500 })
  }
}
