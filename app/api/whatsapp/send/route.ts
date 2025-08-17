// app/api/whatsapp/send/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const userClient = getUserClient()
    const {
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { to, text, org_id } = await req.json()
    if (!to || !text) {
      return NextResponse.json({ error: 'to and text are required' }, { status: 400 })
    }

    const supa = getServiceClient()

    // Save to outbox (queue) even if WA not configured
    const { data: row, error: insertErr } = await supa
      .from('outbox')
      .insert({
        to_phone: to,
        text,
        org_id: org_id ?? null,
        provider: 'whatsapp',
        provider_status: 'QUEUED',
        created_by: user.id,
      })
      .select('id')
      .single()
    if (insertErr) throw insertErr

    // If you have WhatsApp credentials set, you can call Meta API here.
    // For now we just queue it and return success.
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to send' }, { status: 500 })
  }
}
