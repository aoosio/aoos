export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const { org_id, user_id } = await req.json() as { org_id: string; user_id: string }
  if (!org_id || !user_id) return new Response('org_id and user_id are required', { status: 400 })

  const token = cookies().get('sb-access-token')?.value
  const userClient = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${token ?? ''}` } } })

  const { data: mine } = await userClient.from('org_members').select('role').eq('org_id', org_id).maybeSingle()
  if (!mine || mine.role !== 'owner') return new Response('Only owners can remove members', { status: 403 })

  const admin = createClient(URL, SRK)
  const { error } = await admin.from('org_members').delete().match({ org_id, user_id })
  if (error) return new Response(error.message, { status: 400 })

  return Response.json({ ok: true })
}
