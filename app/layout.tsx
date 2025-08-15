// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Sidebar from './(shell)/sidebar'
import Topbar from './(shell)/topbar'

export const metadata: Metadata = {
  title: 'AOOS',
  description: 'Purchase Ops over WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid min-h-screen grid-rows-[auto,1fr] md:grid-rows-1 md:grid-cols-[16rem,1fr]">
          <Sidebar />
          <div className="flex flex-col">
            <Topbar />
            <main className="container-page">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
