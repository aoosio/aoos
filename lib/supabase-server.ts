// lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

/** Service client (bypasses RLS). Use ONLY in server routes. */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase service envs (URL / SERVICE_ROLE_KEY)')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Cookie-bound user client (to read current user in routes). */
export function getUserClient() {
  return createRouteHandlerClient({ cookies })
}

/** Convenience: get current user id (or null). */
export async function getUserId(): Promise<string | null> {
  const uc = getUserClient()
  const { data } = await uc.auth.getUser()
  return data?.user?.id ?? null
}
