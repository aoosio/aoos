'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

type SuggestionRow = {
  id: string
  kind: string | null
  subtype: string | null
  status: string | null
  reason: string | null
  recommended_qty: number | null
  created_at: string
  product_id: string | null
  supplier_id: string | null
}

async function loadSuggestions(): Promise<SuggestionRow[]> {
  const { data, error } = await supabase
    .from('suggestions')
    .select('id, kind, subtype, status, reason, recommended_qty, created_at, product_id, supplier_id')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as SuggestionRow[]
}

function StatusPill({ value }: { value: string | null }) {
  const cls =
    value === 'PENDING'
      ? 'bg-amber-100 text-amber-800'
      : value === 'DONE' || value === 'APPROVED'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value ?? '-'}
    </span>
  )
}

export default function SuggestionsPage() {
  const { t } = useI18n()
  const { data } = useSWR<SuggestionRow[]>('suggestions', loadSuggestions)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('suggestions.title')}</h1>
        <Link href="/pos">
          <Button>{t('suggestions.create')}</Button>
        </Link>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>{t('suggestions.type')}</TH>
            <TH>{t('suggestions.reason')}</TH>
            <TH>{t('suggestions.recQty')}</TH>
            <TH>{t('suggestions.status')}</TH>
            <TH>{t('suggestions.created')}</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {(data ?? []).map((s) => (
            <TR key={s.id}>
              <TD>{[s.kind, s.subtype].filter(Boolean).join('/') || '-'}</TD>
              <TD>
                <div className="max-w-[28rem] truncate" title={s.reason ?? ''}>
                  {s.reason ?? '-'}
                </div>
              </TD>
              <TD>{s.recommended_qty ?? '-'}</TD>
              <TD><StatusPill value={s.status} /></TD>
              <TD>{new Date(s.created_at).toLocaleString()}</TD>
              <TD className="text-right">
                <Button variant="secondary">{t('suggestions.act')}</Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
