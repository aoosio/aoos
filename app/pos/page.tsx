'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

async function loadPOs() {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('id, po_number, status, created_at, promised_date, delivered_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export default function POsPage() {
  const { data } = useSWR('pos', loadPOs)
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Purchase Orders</h1>
        <Button variant="secondary">New PO</Button>
      </div>
      <Table>
        <THead>
          <TR><TH>PO #</TH><TH>Status</TH><TH>Promised</TH><TH>Delivered</TH><TH>Created</TH></TR>
        </THead>
        <TBody>
          {(data ?? []).map((p) => (
            <TR key={p.id}>
              <TD>{p.po_number}</TD>
              <TD>{p.status}</TD>
              <TD>{p.promised_date ? new Date(p.promised_date).toLocaleDateString() : '-'}</TD>
              <TD>{p.delivered_at ? new Date(p.delivered_at).toLocaleDateString() : '-'}</TD>
              <TD>{new Date(p.created_at!).toLocaleString()}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}