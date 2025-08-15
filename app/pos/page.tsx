'use client'

import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

type PORow = {
  id: string
  po_number: string | null
  status: string | null
  created_at: string
  promised_date: string | null
  delivered_at: string | null
}

async function loadPOs(): Promise<PORow[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('id, po_number, status, created_at, promised_date, delivered_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as PORow[]
}

export default function POsPage() {
  const { t } = useI18n()
  const { data } = useSWR<PORow[]>('pos', loadPOs)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('pos.title')}</h1>
        <Button variant="secondary">{t('pos.new')}</Button>
      </div>

      <Table>
        <THead>
          <TR>
            <TH>{t('pos.poNumber')}</TH>
            <TH>{t('pos.status')}</TH>
            <TH>{t('pos.promised')}</TH>
            <TH>{t('pos.delivered')}</TH>
            <TH>{t('pos.created')}</TH>
          </TR>
        </THead>
        <TBody>
          {(data ?? []).map((p) => (
            <TR key={p.id}>
              <TD>{p.po_number ?? '-'}</TD>
              <TD>{p.status ?? '-'}</TD>
              <TD>{p.promised_date ? new Date(p.promised_date).toLocaleDateString() : '-'}</TD>
              <TD>{p.delivered_at ? new Date(p.delivered_at).toLocaleDateString() : '-'}</TD>
              <TD>{new Date(p.created_at).toLocaleString()}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
