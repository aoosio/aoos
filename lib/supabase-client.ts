// lib/supabase-client.ts
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type PubEnv = { url: string; key: string }

let cached: PubEnv | null = null
let inflight: Promise<PubEnv> | null = null

async function fetchEnv(): Promise<PubEnv> {
  // prefer build-time NEXT_PUBLIC if present
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && key) return { url, key }

  // else fetch on the fly from API (works on Preview too)
  if (!inflight) {
    inflight = fetch('/api/public-env', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Missing Supabase env (server)')
        return (await r.json()) as PubEnv
      })
      .finally(() => {
        // allow re-fetch if it fails
        setTimeout(() => (inflight = null), 0)
      })
  }
  const env = await inflight
  cached = env
  return env
}

export async function getSupabaseClient() {
  const env = cached ?? (await fetchEnv())
  return createClientComponentClient({
    supabaseUrl: env.url,
    supabaseKey: env.key,
  })
}
