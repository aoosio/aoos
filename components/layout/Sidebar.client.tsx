'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { useI18n } from '@/lib/i18n'

export type Flags = {
  isStaff: boolean
  canTeamManage: boolean  // OWNER or ADMIN
  isOrgMember: boolean    // any of OWNER/ADMIN/PO_MANAGER
}

type Item = { href: Route; label: string; show: boolean }

export default function SidebarClient({ flags }: { flags: Flags }) {
  const { t } = useI18n()
  const pathname = usePathname()

  const items: Item[] = [
    { href: '/home',         label: t('nav.home'),        show: true },
    { href: '/suggestions',  label: t('nav.suggestions'), show: true },
    { href: '/pos',          label: t('nav.pos'),         show: true },
    { href: '/suppliers',    label: t('nav.suppliers'),   show: true },
    { href: '/uploads',      label: t('nav.uploads'),     show: true },
    { href: '/outbox',       label: t('nav.outbox'),      show: true },
    { href: '/templates',    label: t('nav.templates'),   show: true },             // all authed: read-only unless staff
    { href: '/people',       label: t('nav.team'),        show: flags.canTeamManage },
    { href: '/settings',     label: t('nav.settings'),    show: flags.canTeamManage },
    { href: '/audit',        label: t('nav.audit'),       show: flags.canTeamManage },
    { href: '/support',      label: t('nav.support'),     show: flags.isOrgMember }, // org member UI only
    { href: '/admin',        label: 'Admin',              show: flags.isStaff },
    { href: '/admin/messages', label: 'Platform Inbox',   show: flags.isStaff },
  ]

  return (
    <nav className="rounded border p-2 shadow-soft">
      <ul className="space-y-1">
        {items.filter(i => i.show).map((i) => {
          const active = pathname === i.href || pathname?.startsWith(`${i.href}/`)
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`block rounded px-3 py-2 text-sm hover:bg-neutral-50 ${active ? 'bg-brand/10 text-brand-800 font-medium' : ''}`}
              >
                {i.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
