'use client'

import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'

type Row = {
  id: string
  created_at: string
  action: string
  actor: string | null
  entity_type: string
  entity_id: string
  meta: any
}

async function loadAudit(): Promise<Row[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('id,created_at,action,actor,entity_type,entity_id,meta')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as Row[]
}

export default function AuditPage() {
  const { t } = useI18n()
  const { data } = useSWR<Row[]>('audit', loadAudit)

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">{t('audit.title')}</h1>

      <Table>
        <THead>
          <TR>
            <TH>{t('audit.meta')}</TH>
            <TH>{t('audit.entity')}</TH>
            <TH>{t('audit.action')}</TH>
            <TH>{t('audit.actor')}</TH>
            <TH>{t('audit.time')}</TH>
          </TR>
        </THead>
        <TBody>
          {(data ?? []).map((a) => (
            <TR key={a.id}>
              <TD>
                <div className="max-w-[30rem] truncate" title={JSON.stringify(a.meta)}>
                  {JSON.stringify(a.meta)}
                </div>
              </TD>
              <TD>{a.entity_type}/{a.entity_id}</TD>
              <TD>{a.action}</TD>
              <TD>{a.actor ?? '-'}</TD>
              <TD>{new Date(a.created_at).toLocaleString()}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
