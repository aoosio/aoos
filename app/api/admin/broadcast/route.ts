export const runtime = 'nodejs'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: admin } = await supabase
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) return new Response('Unauthorized', { status: 403 })

  const { subject, body, audience, org_id } = await req.json().catch(() => ({}))
  if (!subject || !body) return new Response('subject and body are required', { status: 400 })
  const aud = audience === 'org' ? 'org' : 'all'
  const payload = { subject, body, audience: aud, org_id: aud === 'org' ? org_id ?? null : null }

  const { error } = await supabase.from('admin_messages').insert(payload)
  if (error) return new Response(error.message, { status: 400 })

  return Response.json({ ok: true })
}
