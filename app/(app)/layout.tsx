import './globals.css'
import { I18nProvider } from '@/lib/i18n'
import { cookies } from 'next/headers'

export const metadata = { title: 'AOOS', description: 'From insight to action.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLang = cookies().get('aoos.lang')?.value === 'ar' ? 'ar' : 'en'
  const dir = cookieLang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={cookieLang} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
