import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import SidebarClient, { type Flags } from './Sidebar.client'
import { getRoles } from '@/lib/supabase-server'

export default async function Sidebar() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase.auth.getUser()
  let flags: Flags = { isStaff: false, canTeamManage: false, isOrgMember: false }

  if (data?.user?.id) {
    const roles = await getRoles(data.user.id)
    const isStaff = !!(roles.is_platform_owner || roles.is_platform_admin)
    const canTeamManage = roles.org_role === 'OWNER' || roles.org_role === 'ADMIN'
    const isOrgMember = !!roles.org_role
    flags = { isStaff, canTeamManage, isOrgMember }
  }

  return <SidebarClient flags={flags} />
}
