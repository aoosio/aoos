export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { phone_number_id, waba_id, access_token } = await req.json()
    if (!phone_number_id || !waba_id || !access_token) {
      return NextResponse.json({ error: 'phone_number_id, waba_id, access_token are required' }, { status: 400 })
    }

    const svc = getServiceClient()
    const shape = await getDbShape()

    const { data: myMem } = await svc
      .from(shape.members.table)
      .select('org_id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()
    const org_id = myMem?.org_id
    if (!org_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    const token_hint = access_token.slice(0, 6) + '...' + access_token.slice(-4)
    const token_masked = '****' + access_token.slice(-4)

    const up: any = { org_id, phone_number_id, waba_id, is_connected: true }
    if (shape.waChannel.cols.token_encrypted) up.token_encrypted = access_token
    if (shape.waChannel.cols.token_masked) up.token_masked = token_masked
    if (shape.waChannel.cols.token_hint) up.token_hint = token_hint

    const { error } = await svc.from(shape.waChannel.table).upsert(up, { onConflict: 'org_id' })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to save WhatsApp settings' }, { status: 500 })
  }
}
