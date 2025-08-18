// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'AOOS',
  description: 'From insight to action.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
