// app/api/templates/save/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient, getRoles } from '@/lib/supabase-server'

async function resolveTable(svc: ReturnType<typeof getServiceClient>): Promise<string> {
  const tryHead = async (t: string) => !(await svc.from(t).select('*', { head: true }).limit(1)).error
  if (await tryHead('message_templates')) return 'message_templates'
  if (await tryHead('templates')) return 'templates'
  return 'message_templates'
}

export async function POST(req: Request) {
  try {
    const { key, lang, body } = await req.json()
    const supaUser = await getUserClient().auth.getUser()
    const uid = supaUser.data.user?.id
    if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const roles = await getRoles(uid)
    if (!roles.is_platform_owner) return NextResponse.json({ error: 'Owner only' }, { status: 403 })

    if (!key || !lang) return NextResponse.json({ error: 'key/lang required' }, { status: 400 })

    const svc = getServiceClient()
    const table = await resolveTable(svc)
    const row: any = { key, lang, scope: 'GLOBAL', body }
    // onConflict across the common unique fields
    const { error } = await svc.from(table).upsert(row, { onConflict: 'key,lang,scope' })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Save failed' }, { status: 500 })
  }
}
