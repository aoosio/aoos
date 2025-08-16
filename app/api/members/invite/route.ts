import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const { email, org_id, role = 'po_manager' } = await req.json() as { email: string; org_id: string; role?: 'po_manager'|'owner' }

  if (!email || !org_id) return new Response('email and org_id are required', { status: 400 })

  // user-scoped client (to verify caller is owner)
  const token = cookies().get('sb-access-token')?.value
  const userClient = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${token ?? ''}` } } })

  const { data: me } = await userClient.auth.getUser()
  if (!me?.user) return new Response('Unauthorized', { status: 401 })

  const { data: mine, error: rolesErr } = await userClient
    .from('org_members').select('role').eq('org_id', org_id).maybeSingle()
  if (rolesErr) return new Response(rolesErr.message, { status: 400 })
  if (!mine || mine.role !== 'owner') return new Response('Only owners can invite', { status: 403 })

  // admin client to invite + insert membership
  const admin = createClient(URL, SRK)

  // try invite; if user already exists, fetch them
  let userId: string | null = null
  const res = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${req.nextUrl.origin}/login` })
  if ('error' in res && res.error) {
    // try to find existing user by listing (limited but OK here)
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    const u = listed?.data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!u) return new Response(res.error.message, { status: 400 })
    userId = u.id
  } else {
    userId = res.data.user.id
  }

  const { error: insErr } = await admin.from('org_members').insert({ org_id, user_id: userId, role, email })
  if (insErr && !/duplicate key/i.test(insErr.message)) {
    return new Response(insErr.message, { status: 400 })
  }

  return Response.json({ ok: true })
}
