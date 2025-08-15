// app/layout.tsx
import './globals.css'
import Sidebar from './(shell)/sidebar'
import Topbar from './(shell)/topbar'
import { I18nProvider } from '@/lib/i18n'

export const metadata = {
  title: 'AOOS',
  description: 'Purchase Ops over WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <I18nProvider>
          <div className="grid min-h-screen grid-rows-[auto,1fr] md:grid-rows-1 md:grid-cols-[16rem,1fr]">
            <Sidebar />
            <div className="flex flex-col">
              <Topbar />
              <main className="container-page">{children}</main>
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
