export const runtime = 'nodejs'
// app/api/admin/messages/send/route.ts
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest) {
  const { subject, body, org_id } = (await req.json()) as {
    subject?: string
    body: string
    org_id?: string | null
  }
  if (!body?.trim()) return new Response('Body is required', { status: 400 })

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // RLS enforces staff-only insert; no server key needed
  const { error } = await supabase.from('admin_messages').insert({
    sent_by: user.id,
    subject: subject ?? null,
    body,
    org_id: org_id ?? null,
  })
  if (error) return new Response(error.message, { status: 403 })
  return Response.json({ ok: true })
}
