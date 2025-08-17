export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserId } from '@/lib/supabase-server'
import { getDbShape } from '@/lib/db-adapter'

export async function POST(req: Request) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { to, text } = await req.json()
    if (!to || !text) return NextResponse.json({ error: 'to and text are required' }, { status: 400 })

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

    let insertPayload: any = { org_id }
    if (shape.outbox.variant === 'whatsapp') {
      insertPayload.to_phone = String(to)
      if (shape.outbox.cols.template_name) insertPayload.template_name = 'free_text'
      if (shape.outbox.cols.payload) insertPayload.payload = { text }
      if (shape.outbox.cols.rendered_text) insertPayload.rendered_text = text
      if (shape.outbox.cols.provider_status) insertPayload.provider_status = 'QUEUED'
      if (shape.outbox.cols.created_by) insertPayload.created_by = userId
    } else {
      // plain outbox(text)
      insertPayload.to_phone = String(to)
      insertPayload.text = text
    }

    const { data, error } = await svc.from(shape.outbox.table).insert(insertPayload).select('id').single()
    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to send' }, { status: 500 })
  }
}
