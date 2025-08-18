import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n'

export const runtime = 'nodejs' // نريد Node runtime (بعض حِزم supabase لا تعمل على Edge)

export const metadata: Metadata = {
  title: 'AOOS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider initialLang="en">
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
