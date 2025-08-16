'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { supabase } from '@/lib/supabase-client'
import {
  Home,
  Boxes,
  ClipboardList,
  Users,
  Upload,
  MessageSquare,
  FileText,
  ListChecks,
  Settings,
  LifeBuoy,
  UserPlus,
  BarChart3,
  Megaphone,
} from 'lucide-react'

type NavItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  key: string
  fallback: string
  show?: boolean
}

function isActive(path: string, href: string) {
  return path === href || path.startsWith(href + '/')
}

export default function Sidebar() {
  const path = usePathname()
  const { t } = useI18n()

  const [isOwner, setIsOwner] = useState(false)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)

  useEffect(() => {
    ;(async () => {
      // Is owner in current org?
      const { data: member } = await supabase
        .from('org_members')
        .select('role')
        .limit(1)
        .maybeSingle()
      setIsOwner(member?.role === 'owner')

      // Is platform admin?
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user?.id) return
      const { data: pa } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      setIsPlatformAdmin(!!pa)
    })()
  }, [])

  const main: NavItem[] = [
    { href: '/', icon: Home, key: 'nav.home', fallback: 'Home' },
    { href: '/suggestions', icon: Boxes, key: 'nav.suggestions', fallback: 'Suggestions' },
    { href: '/pos', icon: ClipboardList, key: 'nav.pos', fallback: 'POs' },
    // CHANGE: show Team for everyone (actions are still owner-gated by RLS)
    { href: '/team', icon: UserPlus, key: 'nav.team', fallback: 'Team', show: true },
    { href: '/suppliers', icon: Users, key: 'nav.suppliers', fallback: 'Suppliers' },
    { href: '/uploads', icon: Upload, key: 'nav.uploads', fallback: 'Uploads' },
    { href: '/outbox', icon: MessageSquare, key: 'nav.outbox', fallback: 'Outbox' },
    { href: '/templates', icon: FileText, key: 'nav.templates', fallback: 'Templates' },
    { href: '/audit', icon: ListChecks, key: 'nav.audit', fallback: 'Audit' },
    { href: '/settings', icon: Settings, key: 'nav.settings', fallback: 'Settings' },
    { href: '/support', icon: LifeBuoy, key: 'nav.support', fallback: 'Support', show: true },
  ]

  const admin: NavItem[] = [
    { href: '/admin', icon: BarChart3, key: 'nav.adminDashboard', fallback: 'Admin dashboard', show: isPlatformAdmin },
    { href: '/admin/messages', icon: Megaphone, key: 'nav.adminMessages', fallback: 'Platform inbox', show: isPlatformAdmin },
  ]

  const renderItem = ({ href, icon: Icon, key, fallback }: NavItem) => {
    const active = isActive(path, href)
    const label = t(key)
    const text = label === key ? fallback : label
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
          active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <aside className="hidden md:block border-r border-slate-200 bg-white">
      <div className="sticky top-0 h-screen w-[16rem] p-3">
        <div className="mb-4 px-2 text-lg font-semibold text-blue-700">AOOS</div>

        <nav className="flex flex-col gap-1">
          {main.filter(i => i.show === undefined || i.show).map(renderItem)}

          {isPlatformAdmin && (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {t('nav.admin') === 'nav.admin' ? 'Admin' : t('nav.admin')}
              </div>
              {admin.filter(i => i.show === undefined || i.show).map(renderItem)}
            </>
          )}
        </nav>
      </div>
    </aside>
  )
}
