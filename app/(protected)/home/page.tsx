// app/(protected)/home/page.tsx
'use client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useI18n()
  return (
    // (paste the same JSX you currently have in /app/page.tsx)
    <div>…</div>
  )
}
