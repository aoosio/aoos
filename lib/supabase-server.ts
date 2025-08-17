// lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getDbShape } from './db-adapter'

/** Service client (bypasses RLS). Use ONLY in server routes. */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase URL / SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Cookie-bound user client to read current user within routes. */
export function getUserClient() {
  return createRouteHandlerClient({ cookies })
}

export async function getUserId(): Promise<string | null> {
  const uc = getUserClient()
  const { data } = await uc.auth.getUser()
  return data?.user?.id ?? null
}

/** Attach current user to an org (if one was created_by them), or return org_id if already a member. */
export async function ensureOrgContext(userId: string): Promise<string | null> {
  const svc = getServiceClient()
  const shape = await getDbShape()

  // 1) Already a member?
  const { data: mem } = await svc
    .from(shape.members.table)
    .select('org_id')
    .eq('user_id', userId)
    .order('org_id', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (mem?.org_id) return mem.org_id

  // 2) If the orgs table tracks creator, auto-link as OWNER
  if (shape.orgs.cols.created_by) {
    const { data: org } = await svc
      .from(shape.orgs.table)
      .select('id')
      .eq('created_by', userId)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (org?.id) {
      const m: any = { org_id: org.id, user_id: userId }
      if (shape.members.cols.role) m.role = 'OWNER'
      if (shape.members.cols.is_active) m.is_active = true
      if (shape.members.cols.status) m.status = 'ACTIVE'
      await svc.from(shape.members.table).insert(m)
      return org.id
    }
  }

  // 3) No org yet
  return null
}

/** Role snapshot for the current user (platform + org). */
export async function getRoles(userId: string) {
  const svc = getServiceClient()
  const shape = await getDbShape()
  let is_platform_owner = false
  let is_platform_admin = false
  let org_role: string | null = null

  if (shape.pOwners) {
    const { data } = await svc.from(shape.pOwners.table).select('user_id, is_active').eq('user_id', userId).maybeSingle()
    is_platform_owner = !!data && (data as any).is_active !== false
  }
  if (shape.pAdmins) {
    const { data } = await svc.from(shape.pAdmins.table).select('user_id, is_active').eq('user_id', userId).maybeSingle()
    is_platform_admin = !!data && (data as any).is_active !== false
  }
  const { data: m } = await svc
    .from(shape.members.table)
    .select('role')
    .eq('user_id', userId)
    .order('role', { ascending: true })
    .limit(1)
    .maybeSingle()
  org_role = m?.role ?? null

  return { is_platform_owner, is_platform_admin, org_role }
}
