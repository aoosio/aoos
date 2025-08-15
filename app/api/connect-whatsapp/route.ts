import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { encryptToken } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { org_id, phone_number_id, waba_id, access_token } = body || {}

  if (!org_id || !phone_number_id || !waba_id || !access_token) {
    return new Response('org_id, phone_number_id, waba_id, access_token are required', { status: 400 })
  }

  const KMS = process.env.?WW;co&p]n4-V@q-kp-*IKzffB_l-zS{;nXk27JyZc{BpZM7Te
  const SUPABASE_URL = process.env.pcbbbotaletbnkvusacs.supabase.co
  const SRK = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjYmJib3RhbGV0Ym5rdnVzYWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE5NDYxMywiZXhwIjoyMDcwNzcwNjEzfQ.XyHGLwa-3Y9h-CJajL4VSjvMdEx0VNGo6WqhRaY2C_8
  const API_BASE = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
  const API_VER = process.env.WHATSAPP_API_VERSION || 'v21.0'

  if (!KMS || !SUPABASE_URL || !SRK) {
    return new Response('Server env missing (KMS or Supabase)', { status: 500 })
  }

  const token_encrypted = encryptToken(access_token, KMS)

  // Upsert channel + optimistic connect flag
  const admin = createClient(SUPABASE_URL, SRK)
  const up = await admin.from('channel_whatsapp').upsert({
    org_id, phone_number_id, waba_id,
    connect_method: 'MANUAL',
    is_connected: true,
    token_encrypted,
    last_error: null,
  }, { onConflict: 'org_id' })

  if (up.error) return new Response(up.error.message, { status: 400 })

  // Live tests (IDs + token)
  let last_error: string | null = null
  try {
    // Check phone number resource
    const r1 = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(phone_number_id)}`, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    })
    if (!r1.ok) {
      last_error = `Phone check: ${r1.status}`
      throw new Error(last_error)
    }

    // Check WABA templates (permission scope)
    const r2 = await fetch(`${API_BASE}/${API_VER}/${encodeURIComponent(waba_id)}/message_templates?limit=1`, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    })
    if (!r2.ok) {
      last_error = `Templates check: ${r2.status}`
      throw new Error(last_error)
    }
  } catch (e: any) {
    last_error = e?.message || 'connect test failed'
  } finally {
    await admin.from('channel_whatsapp')
      .update({ last_test_at: new Date().toISOString(), last_error })
      .eq('org_id', org_id)
  }

  return new Response(JSON.stringify({ ok: !last_error, last_error }), { status: 200 })
}
