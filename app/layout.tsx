'use client'
import type { Metadata } from 'next'
import './globals.css'          // إن وُجدت
import { I18nProvider } from '@/lib/i18n'

export const runtime = 'nodejs'

export const metadata: Metadata = { title: 'AOOS' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
