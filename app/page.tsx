'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const fetcher = async (key: string) => {
  if (key === 'counts') {
    const [{ data: s1 }, { data: s2 }, { data: s3 }] = await Promise.all([
      supabase.from('suggestions').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('whatsapp_outbox').select('id', { count: 'exact', head: true }).eq('status', 'FAILED'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'PENDING')
    ])
    return { pending: s1?.length ?? 0, failed: s2?.length ?? 0, inquiries: s3?.length ?? 0 }
  }
  return null
}

export default function Home() {
  const { data } = useSWR('counts', fetcher)
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <div className="text-sm text-slate-500">Pending suggestions</div>
        <div className="mt-1 text-3xl font-semibold">{data?.pending ?? '—'}</div>
        <div className="mt-3"><Link href="/suggestions"><Button>Review now</Button></Link></div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Failed WhatsApp sends (last 30d)</div>
        <div className="mt-1 text-3xl font-semibold">{data?.failed ?? '—'}</div>
        <div className="mt-3"><Link href="/outbox"><Button variant="secondary">See outbox</Button></Link></div>
      </Card>
      <Card>
        <div className="text-sm text-slate-500">Open inquiries</div>
        <div className="mt-1 text-3xl font-semibold">{data?.inquiries ?? '—'}</div>
        <div className="mt-3"><Link href="/suggestions"><Button variant="secondary">Go to inquiries</Button></Link></div>
      </Card>

      <Card className="md:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Next actions</h2>
          <Link href="/suggestions" className="text-sm text-brand-700">Open suggestions →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ActionTile title="Expiry Guard" subtitle="Resolve expiries before refills"/>
          <ActionTile title="Refill Weeks" subtitle="Create POs for low-cover SKUs"/>
          <ActionTile title="Bulk Price" subtitle="Ask for tier price where it makes sense"/>
        </div>
      </Card>
    </div>
  )
}

function ActionTile({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-slate-500">{subtitle}</div>
      <div className="mt-3"><Badge>Ready</Badge></div>
    </div>
  )
}