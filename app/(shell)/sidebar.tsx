'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Boxes, Bot, FileDown, Inbox, LayoutGrid, MessageSquare, Settings, Users, Send, Table as Tbl, FileText } from 'lucide-react'

const nav = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/suggestions', label: 'Suggestions', icon: Bot },
  { href: '/pos', label: 'POs', icon: Send },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/uploads', label: 'Uploads', icon: FileDown },
  { href: '/outbox', label: 'Outbox', icon: MessageSquare },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/audit', label: 'Audit', icon: Tbl },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col gap-2 border-r border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 px-2 py-1 text-brand-700 font-semibold">
        <Boxes className="h-5 w-5" /> AOOS
      </div>
      <nav className="mt-3 grid gap-1">
        {nav.map((i) => (
          <Link key={i.href} href={i.href} className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100', pathname === i.href && 'bg-slate-100 text-slate-900 font-medium')}>
            <i.icon className="h-4 w-4" /> {i.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-xs text-slate-400">— Sent via AOOS • aoos.io</div>
    </aside>
  )
}