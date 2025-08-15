'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="grid gap-6">
      {/* KPI bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6 flex flex-col items-start">
          <div className="text-slate-500 mb-3">{t('home.stats.openInquiries')}</div>
          <div className="text-5xl font-semibold mb-4">0</div>
          <Link href="/pos">
            <Button variant="secondary">{t('home.cta.inquiries')}</Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col items-start">
          <div className="text-slate-500 mb-3">{t('home.stats.failedSends')}</div>
          <div className="text-5xl font-semibold mb-4">0</div>
          <Link href="/outbox">
            <Button variant="secondary">{t('home.cta.outbox')}</Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col items-start">
          <div className="text-slate-500 mb-3">{t('home.stats.pendingSuggestions')}</div>
          <div className="text-5xl font-semibold mb-4">0</div>
          <Link href="/suggestions">
            <Button>{t('home.cta.reviewNow')}</Button>
          </Link>
        </Card>
      </div>

      {/* Suggestions / Actions */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sky-600 font-medium">→ {t('home.openSuggestions')}</div>
          <div className="text-xl font-semibold">{t('home.nextActions')}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <div className="text-xl font-semibold mb-2">{t('home.actions.bulkPrice.title')}</div>
            <div className="text-slate-600">{t('home.actions.bulkPrice.desc')}</div>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
              {t('home.ready')}
            </span>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-xl font-semibold mb-2">{t('home.actions.refillWeeks.title')}</div>
            <div className="text-slate-600">{t('home.actions.refillWeeks.desc')}</div>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
              {t('home.ready')}
            </span>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-xl font-semibold mb-2">{t('home.actions.expiryGuard.title')}</div>
            <div className="text-slate-600">{t('home.actions.expiryGuard.desc')}</div>
            <span className="mt-4 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
              {t('home.ready')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
