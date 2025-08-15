import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY! // set in Vercel
const supa = createClient(SUPABASE_URL, SRK)

export async function POST(req: Request) {
  const { org_id, email, role } = await req.json()
  if (!org_id || !email || !['owner','po_manager'].includes(role)) {
    return new Response('org_id,email,role required', { status: 400 })
  }
  // create/invite user
  const { data: invite, error: invErr } = await supa.auth.admin.inviteUserByEmail(email)
  if (invErr) return new Response(invErr.message, { status: 400 })
  const user_id = invite.user?.id
  if (!user_id) return new Response('No user id', { status: 400 })

  // attach to org
  const { error: upErr } = await supa.from('org_members')
    .upsert({ org_id, user_id, role }, { onConflict: 'org_id,user_id' })
  if (upErr) return new Response(upErr.message, { status: 400 })

  return NextResponse.json({ ok: true })
}
