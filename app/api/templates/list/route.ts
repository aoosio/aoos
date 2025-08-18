// app/api/templates/list/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient, getRoles, ensureOrgContext } from '@/lib/supabase-server'

async function resolveTable(svc: ReturnType<typeof getServiceClient>): Promise<string> {
  const tryHead = async (t: string) => !(await svc.from(t).select('*', { head: true }).limit(1)).error
  if (await tryHead('message_templates')) return 'message_templates'
  if (await tryHead('templates')) return 'templates'
  return 'message_templates'
}

export async function GET() {
  const svc = getServiceClient()
  const user = await getUserClient().auth.getUser().then(r=>r.data.user)
  const uid = user?.id || null
  const roles = uid ? await getRoles(uid) : { is_platform_owner:false, is_platform_admin:false, org_role:null as any }
  const canEditGlobal = !!roles.is_platform_owner

  const table = await resolveTable(svc)
  const globals = (await svc.from(table).select('*').eq('scope','GLOBAL').order('key')).data || []

  let orgs: any[] = []
  if (uid) {
    const org_id = await ensureOrgContext(uid)
    if (org_id) {
      // if column org_id exists, filter by it; otherwise just scope='ORG'
      const hasOrgId = !((await svc.from(table).select('org_id', { head: true }).limit(1)).error)
      orgs = (hasOrgId
        ? (await svc.from(table).select('*').eq('scope','ORG').eq('org_id', org_id).order('key')).data
        : (await svc.from(table).select('*').eq('scope','ORG').order('key')).data) || []
    }
  }

  // normalize fields
  const norm = (xs:any[]) => xs.map(t => ({
    id: t.id, key: t.key || t.template_key || t.name,
    lang: t.lang || t.language || t.language_code || 'en',
    scope: (t.scope || 'GLOBAL').toUpperCase(),
    body: t.body || t.text || t.content || null
  }))

  return NextResponse.json({ globals: norm(globals), orgs: norm(orgs), canEditGlobal })
}
