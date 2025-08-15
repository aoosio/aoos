'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

async function loadSuggestions() {
  const { data, error } = await supabase
    .from('suggestions')
    .select('id, kind, subtype, status, reason, recommended_qty, created_at, product_id, supplier_id')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export default function SuggestionsPage() {
  const { data } = useSWR('suggestions', loadSuggestions)
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Suggestions</h1>
        <Link href="/pos"><Button>Create PO</Button></Link>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Type</TH><TH>Reason</TH><TH>Rec. Qty</TH><TH>Status</TH><TH>Created</TH><TH></TH>
          </TR>
        </THead>
        <TBody>
          {(data ?? []).map((s) => (
            <TR key={s.id}>
              <TD>{s.kind}/{s.subtype}</TD>
              <TD className="max-w-[28rem] truncate" title={s.reason ?? ''}>{s.reason ?? '-'}</TD>
              <TD>{s.recommended_qty ?? '-'}</TD>
              <TD><Badge variant={s.status === 'PENDING' ? 'warning' : 'success'}>{s.status}</Badge></TD>
              <TD>{new Date(s.created_at!).toLocaleString()}</TD>
              <TD className="text-right"><Button variant="secondary">Act</Button></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}