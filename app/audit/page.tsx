'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

async function loadAudit() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, created_at, actor_id, action, entity_type, entity_id, meta')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export default function AuditPage() {
  const { data } = useSWR('audit', loadAudit)
  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">Audit Log</h1>
      <Table>
        <THead>
          <TR><TH>Time</TH><TH>Actor</TH><TH>Action</TH><TH>Entity</TH><TH>Meta</TH></TR>
        </THead>
        <TBody>
          {(data ?? []).map((a) => (
            <TR key={a.id}>
              <TD>{new Date(a.created_at!).toLocaleString()}</TD>
              <TD>{a.actor_id}</TD>
              <TD>{a.action}</TD>
              <TD>{a.entity_type}/{a.entity_id}</TD>
              <TD className="max-w-[30rem] truncate" title={JSON.stringify(a.meta)}>{JSON.stringify(a.meta)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}