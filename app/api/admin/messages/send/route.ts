import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  const { subject, body, org_id } = await req.json() as { subject?: string; body: string; org_id?: string | null }
  if (!body?.trim()) return new Response('Body is required', { status: 400 })

  const access = cookies().get('sb-access-token')?.value
  const supabase = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${access ?? ''}` } } })

  const { data: me } = await supabase.auth.getUser()
  if (!me?.user) return new Response('Unauthorized', { status: 401 })

  // Only platform admins can insert by RLS; if not, this returns error
  const { error } = await supabase.from('admin_messages').insert({
    sent_by: me.user.id, subject: subject ?? null, body, org_id: org_id ?? null
  })
  if (error) return new Response(error.message, { status: 403 })

  return Response.json({ ok: true })
}
