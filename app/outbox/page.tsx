'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

async function loadOutbox() {
  const { data, error } = await supabase
    .from('whatsapp_outbox')
    .select('id, created_at, to_phone, status, provider_status, template_id, rendered_text')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export default function OutboxPage() {
  const { data } = useSWR('outbox', loadOutbox)
  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">WhatsApp Outbox</h1>
      <Table>
        <THead>
          <TR><TH>Time</TH><TH>To</TH><TH>Status</TH><TH>Provider</TH><TH>Preview</TH></TR>
        </THead>
        <TBody>
          {(data ?? []).map(o => (
            <TR key={o.id}>
              <TD>{new Date(o.created_at!).toLocaleString()}</TD>
              <TD>{o.to_phone}</TD>
              <TD><Badge variant={o.status === 'FAILED' ? 'danger' : o.status === 'SENT' ? 'success' : 'default'}>{o.status}</Badge></TD>
              <TD>{o.provider_status ?? '-'}</TD>
              <TD className="max-w-[24rem] truncate" title={o.rendered_text ?? ''}>{o.rendered_text ?? '-'}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}