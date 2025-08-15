'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// no <Database> generic — runtime works fine
export const supabase = createClientComponentClient()
