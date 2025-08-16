'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Stats = {
  orgs: number
  owners: number
  po_managers: number
  po_count: number
  accepted_suggest_qty: number
  accepted_suggests: number
  failed_sends_30d: number
  errors: number
}

async function loadStats(): Promise<Stats | null> {
  const { data, error } = await supabase.from('admin_v_stats').select('*').maybeSingle()
  if (error) throw error
  return data as any
}

export default function AdminPage() {
  const { data } = useSWR('admin_stats', loadStats)
  if (!data) return null

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">AOOS Admin</h1>
      <Table>
        <THead><TR><TH>Metric</TH><TH>Value</TH></TR></THead>
        <TBody>
          <TR><TD>Active orgs</TD><TD>{data.orgs}</TD></TR>
          <TR><TD>Owners</TD><TD>{data.owners}</TD></TR>
          <TR><TD>PO managers</TD><TD>{data.po_managers}</TD></TR>
          <TR><TD>Purchase Orders</TD><TD>{data.po_count}</TD></TR>
          <TR><TD>Accepted suggestions</TD><TD>{data.accepted_suggests}</TD></TR>
          <TR><TD>Qty from accepted suggestions</TD><TD>{data.accepted_suggest_qty}</TD></TR>
          <TR><TD>Failed WhatsApp sends (30d)</TD><TD>{data.failed_sends_30d}</TD></TR>
          <TR><TD>System errors</TD><TD>{data.errors}</TD></TR>
        </TBody>
      </Table>
    </Card>
  )
}
