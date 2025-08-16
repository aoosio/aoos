// app/(protected)/layout.tsx
import Topbar from '@/app/(shell)/topbar'
import Sidebar from '@/app/(shell)/sidebar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="grid grid-cols-[16rem_1fr] gap-6 p-6">
        <aside><Sidebar /></aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
