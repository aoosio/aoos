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
  labelKey: string
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
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) return
      const { data: pa } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', uid)
        .maybeSingle()
      setIsPlatformAdmin(!!pa)
    })()
  }, [])

  const main: NavItem[] = [
    { href: '/', icon: Home, labelKey: 'nav.home' },
    { href: '/suggestions', icon: Boxes, labelKey: 'nav.suggestions' },
    { href: '/pos', icon: ClipboardList, labelKey: 'nav.pos' },
    { href: '/suppliers', icon: Users, labelKey: 'nav.suppliers' },
    { href: '/uploads', icon: Upload, labelKey: 'nav.uploads' },
    { href: '/outbox', icon: MessageSquare, labelKey: 'nav.outbox' },
    { href: '/templates', icon: FileText, labelKey: 'nav.templates' },
    { href: '/audit', icon: ListChecks, labelKey: 'nav.audit' },
    { href: '/settings', icon: Settings, labelKey: 'nav.settings' },
    // Always visible support inbox
    { href: '/support', icon: LifeBuoy, labelKey: 'nav.support', show: true },
    // Owner-only: manage people
    { href: '/people', icon: UserPlus, labelKey: 'nav.people', show: isOwner },
  ]

  const admin: NavItem[] = [
    { href: '/admin', icon: BarChart3, labelKey: 'nav.adminDashboard', show: isPlatformAdmin },
    { href: '/admin/messages', icon: Megaphone, labelKey: 'nav.adminMessages', show: isPlatformAdmin },
  ]

  return (
    <aside className="hidden md:block border-r border-slate-200 bg-white">
      <div className="sticky top-0 h-screen w-[16rem] p-3">
        <div className="mb-4 px-2 text-lg font-semibold text-blue-700">AOOS</div>

        <nav className="flex flex-col gap-1">
          {main
            .filter((i) => i.show === undefined || i.show)
            .map(({ href, icon: Icon, labelKey }) => {
              const active = isActive(path, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(labelKey)}</span>
                </Link>
              )
            })}

          {isPlatformAdmin && (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {t('nav.admin')}
              </div>
              {admin
                .filter((i) => i.show === undefined || i.show)
                .map(({ href, icon: Icon, labelKey }) => {
                  const active = isActive(path, href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{t(labelKey)}</span>
                    </Link>
                  )
                })}
            </>
          )}
        </nav>
      </div>
    </aside>
  )
}
