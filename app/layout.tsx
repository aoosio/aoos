import './globals.css'
import { I18nProvider } from '@/lib/i18n' // ← named export from your file

export const metadata = { title: 'AOOS', description: 'From insight to action.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
