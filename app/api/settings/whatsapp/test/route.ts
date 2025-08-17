// app/api/settings/whatsapp/test/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId, ensureOrgContext } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'
import { decryptToken } from '@/lib/crypto'

export async function POST() {
  try {
    const uid = await getUserId()
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    const svc = getServiceClient()
    const shape = await getDbShape()
    const org_id = await ensureOrgContext(uid)
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const { data: ch } = await svc.from(shape.waChannel.table)
      .select('*')
      .eq('org_id', org_id)
      .maybeSingle()
    if (!ch) return NextResponse.json({ error: 'No WhatsApp channel saved' }, { status: 400 })

    const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
    const ver = process.env.WHATSAPP_API_VERSION || 'v21.0'
    const pnid = ch.phone_number_id
    if (!pnid) return NextResponse.json({ error: 'Phone Number ID missing' }, { status: 400 })
    const tokenEnc = ch.token_encrypted
    if (!tokenEnc) return NextResponse.json({ error: 'Access token missing' }, { status: 400 })
    const token = decryptToken(tokenEnc)

    const url = `${base}/${ver}/${encodeURIComponent(pnid)}?fields=display_name`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const j = await r.json().catch(() => ({}))

    if (!r.ok) {
      return NextResponse.json({ ok: false, status: r.status, error: j?.error?.message || 'Graph error' }, { status: 200 })
    }

    // mark connected
    if (shape.waChannel.cols.is_connected) {
      await svc.from(shape.waChannel.table).update({ is_connected: true }).eq('org_id', org_id)
    }

    return NextResponse.json({ ok: true, graph: j })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to test connection' }, { status: 500 })
  }
}
