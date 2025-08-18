// app/(app)/layout.tsx
import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar.client'
import Topbar from '@/components/layout/Topbar'

export const dynamic = 'force-dynamic' // تجنّب التوليد الثابت لهذا الإطار

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden border-r bg-white md:block">
          <Sidebar />
        </aside>
        <div className="flex min-h-dvh flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
