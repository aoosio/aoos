import './globals.css'
import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr] gap-6 px-6 py-6">
        <aside className="hidden md:block">
          <Sidebar />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}
