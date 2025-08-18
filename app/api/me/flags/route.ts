// app/api/me/flags/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getUserClient, getRoles } from '@/lib/supabase-server'

export async function GET() {
  const supa = getUserClient()
  const { data: { user } } = await supa.auth.getUser()

  const flags = { isStaff:false, canTeamManage:false, isOrgMember:false }
  if (user?.id) {
    const r = await getRoles(user.id)
    flags.isStaff = !!(r.is_platform_owner || r.is_platform_admin)
    flags.canTeamManage = r.org_role === 'OWNER' || r.org_role === 'ADMIN'
    flags.isOrgMember = !!r.org_role
  }
  return NextResponse.json({ flags })
}
