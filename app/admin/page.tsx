'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Stats = {
  orgs_count: number
  owners_count: number
  po_managers_count: number
  purchase_orders_count: number
  accepted_suggest_qty: number
  error_count: number
  accepted_suggestions: number
  total_suggestions: number
}

async function loadStats(): Promise<Stats> {
  const { data, error } = await supabase.rpc('admin_stats_overview')
  if (error) throw error
  return (data as any[])[0] as Stats
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  )
}

export default function AdminHome() {
  const { data } = useSWR('admin-stats', loadStats)

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-4 text-lg font-semibold">Admin Overview</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Active markets (owners)" value={data?.orgs_count ?? '—'} />
          <Metric label="Owners" value={data?.owners_count ?? '—'} />
          <Metric label="PO managers" value={data?.po_managers_count ?? '—'} />
          <Metric label="POs created" value={data?.purchase_orders_count ?? '—'} />
          <Metric label="Qty suggested & accepted" value={data?.accepted_suggest_qty ?? '—'} />
          <Metric label="System errors (audit)" value={data?.error_count ?? '—'} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Suggestions acceptance</h2>
        <Table>
          <THead>
            <TR><TH>Accepted</TH><TH>Total</TH><TH>Acceptance rate</TH></TR>
          </THead>
          <TBody>
            <TR>
              <TD>{data?.accepted_suggestions ?? '—'}</TD>
              <TD>{data?.total_suggestions ?? '—'}</TD>
              <TD>
                {data ? `${Math.round(((data.accepted_suggestions || 0) / Math.max(1, data.total_suggestions || 0)) * 100)}%` : '—'}
              </TD>
            </TR>
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
