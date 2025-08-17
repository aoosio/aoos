// app/api/me/roles/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserId, getRoles } from '@/lib/supabase-server'

export async function GET() {
  const uid = await getUserId()
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const roles = await getRoles(uid)
  return NextResponse.json(roles)
}
