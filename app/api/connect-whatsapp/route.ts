// app/api/connect-whatsapp/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient } from '@/lib/supabase-server'
import { requireOrgRole } from '@/lib/rbac'
import { getDbShape } from '@/lib/db-adapter'
import { encryptToken, maskToken } from '@/lib/crypto'

const API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
const API_VER  = process.env.WHATSAPP_API_VERSION || 'v21.0'

export async function POST(req: Request) {
  try {
    const { org_id, phone_number_id, waba_id, access_token, test_to } = await req.json()

    if (!org_id) return NextResponse.json({ error: 'org_id required' }, { status: 400 })
    await requireOrgRole(org_id, ['OWNER']) // Owner only

    if (!access_token || !phone_number_id)
      return NextResponse.json({ error: 'phone_number_id and access_token required' }, { status: 400 })

    const supabase = getUserClient()
    const shape = await getDbShape()

    // Save encrypted token + IDs
    const blob = encryptToken(String(access_token))
    const { masked, hint } = maskToken(String(access_token))
    const row: any = { org_id }
    if (shape.waChannel.cols.phone_number_id) row.phone_number_id = String(phone_number_id).trim()
    if (shape.waChannel.cols.waba_id && waba_id !== undefined) row.waba_id = String(waba_id).trim()
    if (shape.waChannel.cols.token_encrypted) row.token_encrypted = blob
    if (shape.waChannel.cols.token_masked)    row.token_masked    = masked
    if (shape.waChannel.cols.token_hint)      row.token_hint      = hint
    if (shape.waChannel.cols.is_connected)    row.is_connected    = true

    {
      const { error } = await supabase.from(shape.waChannel.table).upsert(row, { onConflict: 'org_id' })
      if (error) throw error
    }

    // Test the token/number (prefer a metadata GET; optional send test if test_to provided)
    let ok = false
    let provider_status: string | null = null
    let provider_message_id: string | null = null

    // Basic capability check
    const metaRes = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(String(phone_number_id))}?fields=display_phone_number`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    })
    ok = metaRes.ok
    provider_status = ok ? 'OK' : `META_HTTP_${metaRes.status}`

    // Optional live test message
    if (ok && test_to) {
      const final_text = 'AOOS WhatsApp connected ✅'
      const sendRes = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(String(phone_number_id))}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: String(test_to),
          type: 'text',
          text: { preview_url: false, body: final_text }
        }),
        cache: 'no-store'
      })
      const j = await sendRes.json().catch(() => ({}))
      ok = ok && sendRes.ok
      provider_message_id = j?.messages?.[0]?.id ?? null
      provider_status = sendRes.ok ? 'SENT' : (j?.error?.message || `HTTP ${sendRes.status}`)

      // Log to outbox if table exists
      try {
        await supabase.from('whatsapp_outbox').insert({
          org_id, to_phone: String(test_to),
          status: sendRes.ok ? 'SENT' : 'FAILED',
          provider_status, provider_message_id,
          rendered_text: final_text
        })
      } catch {}
    }

    // Touch last_test_at / last_error if present
    try {
      const upd: any = {}
      if (shape.waChannel.cols.last_test_at) upd.last_test_at = new Date().toISOString()
      if (shape.waChannel.cols.last_error)   upd.last_error   = ok ? null : provider_status
      if (Object.keys(upd).length) {
        await supabase.from(shape.waChannel.table).update(upd).eq('org_id', org_id)
      }
    } catch {}

    return NextResponse.json({ ok, provider_status, provider_message_id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to connect WhatsApp' }, { status: 500 })
  }
}
