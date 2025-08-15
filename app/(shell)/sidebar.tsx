'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Home, Boxes, ClipboardList, Users, Upload, MessageSquare, FileText, ListChecks, Settings } from 'lucide-react'

const items = [
  { href: '/', icon: Home, key: 'nav.home' },
  { href: '/suggestions', icon: Boxes, key: 'nav.suggestions' },
  { href: '/pos', icon: ClipboardList, key: 'nav.pos' },
  { href: '/suppliers', icon: Users, key: 'nav.suppliers' },
  { href: '/uploads', icon: Upload, key: 'nav.uploads' },
  { href: '/outbox', icon: MessageSquare, key: 'nav.outbox' },
  { href: '/templates', icon: FileText, key: 'nav.templates' },
  { href: '/audit', icon: ListChecks, key: 'nav.audit' },
  { href: '/settings', icon: Settings, key: 'nav.settings' },
]

export default function Sidebar() {
  const path = usePathname()
  const { t } = useI18n()
  return (
    <aside className="hidden md:block border-r border-slate-200 bg-white">
      <div className="sticky top-0 h-screen w-[16rem] p-3">
        <div className="mb-4 px-2 text-lg font-semibold text-blue-700">AOOS</div>
        <nav className="flex flex-col gap-1">
          {items.map(({ href, icon: Icon, key }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t(key)}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
