// lib/supabase-client.ts
'use client'

import { createClient } from '@supabase/supabase-js'

// If you *already* generated types, uncomment the next line and the generic.
// import type { Database } from '@/lib/database.types'

export const supabase =
  createClient/*<Database>*/(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
