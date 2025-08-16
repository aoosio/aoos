// app/layout.tsx
import './globals.css'
import { I18nProvider } from '@/lib/i18n'

export const metadata = {
  title: 'AOOS',
  description: 'Purchase Ops over WhatsApp',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
