// app/api/whatsapp/send/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decryptToken } from '@/lib/crypto'

function buildFactsBlock(facts?: Record<string, string | number | null | undefined>) {
  if (!facts) return ''
  const lines = Object.entries(facts)
    .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim() !== '')
    .map(([k, v]) => `• ${k}: ${v}`)
  return lines.length ? `\n\n${lines.join('\n')}` : ''
}

export async function POST(req: NextRequest) {
  const { org_id, to_phone, body, facts, signature = '— Sent via AOOS • aoos.io' } = await req.json()

  if (!org_id || !to_phone || !body) {
    return new Response('org_id, to_phone, body required', { status: 400 })
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY
  const KMS = process.env.WHATSAPP_KMS_KEY
  const API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
  const API_VER = process.env.WHATSAPP_API_VERSION || 'v21.0'

  if (!SUPABASE_URL || !SRK || !KMS) return new Response('Server env missing', { status: 500 })

  const admin = createClient(SUPABASE_URL, SRK)

  const { data: ch, error: chErr } = await admin
    .from('channel_whatsapp')
    .select('phone_number_id, token_encrypted')
    .eq('org_id', org_id).single()
  if (chErr || !ch) return new Response('WhatsApp channel not found', { status: 400 })

  const token = decryptToken(ch.token_encrypted!)
  const phone_number_id = ch.phone_number_id!

  const final_text = `${body.trim()}${buildFactsBlock(facts)}\n${signature}`.slice(0, 3900)

  const res = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(phone_number_id)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to_phone,
      type: 'text',
      text: { preview_url: false, body: final_text }
    }),
    cache: 'no-store'
  })

  const j = await res.json().catch(() => ({}))
  const ok = res.ok
  const provider_message_id = j?.messages?.[0]?.id ?? null
  const provider_status = ok ? 'SENT' : (j?.error?.message || `HTTP ${res.status}`)

  await admin.from('whatsapp_outbox').insert({
    org_id, to_phone,
    status: ok ? 'SENT' : 'FAILED',
    provider_status, provider_message_id,
    rendered_text: final_text
  })

  return new Response(JSON.stringify({ ok, provider_message_id, provider_status }), { status: ok ? 200 : 400 })
}
