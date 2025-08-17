// lib/rbac.ts
import { getUserClient } from './supabase-server'

type OrgRole = 'OWNER' | 'ADMIN' | 'PO_MANAGER'

/** Enforce org role via RLS (cookie-bound user). Throws 401/403 on failure. */
export async function requireOrgRole(orgId: string, allow: OrgRole[]) {
  const supabase = getUserClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) throw new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  const role = (data?.role ?? null) as OrgRole | null
  if (error || !role || !allow.includes(role)) {
    throw new Response('Forbidden', { status: 403 })
  }
  return { user, role }
}

/** Convenience: owners or admins can view settings. */
export async function requireOwnerOrAdminView(orgId: string) {
  return requireOrgRole(orgId, ['OWNER', 'ADMIN'])
}
