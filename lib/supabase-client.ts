'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './types' // optional, omit if you don't have generated types

export const supabase = createClientComponentClient<Database>()