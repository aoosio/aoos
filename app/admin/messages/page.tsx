'use client'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Org = { id: string; name?: string | null }
type Msg = { id: string; created_at: string; subject: string | null; body: string; org_id: string | null }

async function loadOrgs(): Promise<Org[]> {
  const { data, error } = await supabase.from('organizations').select('id,name').order('created_at',{ascending:false}).limit(200)
  if (error) throw error
  return data as Org[]
}
async function loadMsgs(): Promise<Msg[]> {
  const { data, error } = await supabase.from('admin_messages').select('id,created_at,subject,body,org_id').order('created_at',{ascending:false}).limit(100)
  if (error) throw error
  return data as Msg[]
}

export default function AdminMessagesPage() {
  const { data: orgs } = useSWR('admin-orgs', loadOrgs)
  const { data: msgs, mutate } = useSWR('admin-msgs', loadMsgs)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [orgId, setOrgId] = useState<string>('') // empty = broadcast
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function send() {
    if (!body.trim()) { setToast('Body required'); return }
    setBusy(true); setToast(null)
    const res = await fetch('/api/admin/messages/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: subject || null, body, org_id: orgId || null })
    })
    setBusy(false)
    if (!res.ok) setToast(await res.text()); else {
      setSubject(''); setBody(''); setOrgId(''); setToast('Sent.'); mutate()
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">Platform inbox</h1>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-slate-600">Subject</label>
            <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Optional subject" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Audience</label>
            <select className="w-full rounded-md border border-slate-200 p-2"
              value={orgId} onChange={e=>setOrgId(e.target.value)}>
              <option value="">All markets (broadcast)</option>
              {(orgs ?? []).map(o => <option key={o.id} value={o.id}>{o.name ?? o.id}</option>)}
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="mb-1 block text-sm text-slate-600">Message</label>
            <textarea className="min-h-[110px] w-full rounded-lg border border-slate-200 p-2"
              value={body} onChange={e=>setBody(e.target.value)} placeholder="Type update or support message…" />
          </div>
          <div className="sm:col-span-4">
            <Button onClick={send} disabled={busy || !body.trim()}>{busy ? 'Sending…' : 'Send'}</Button>
            {toast && <span className="ml-3 text-sm text-slate-600">{toast}</span>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Recent messages</h2>
        <Table>
          <THead><TR><TH>Time</TH><TH>Audience</TH><TH>Subject</TH><TH>Body</TH></TR></THead>
          <TBody>
            {(msgs ?? []).map(m => (
              <TR key={m.id}>
                <TD>{new Date(m.created_at).toLocaleString()}</TD>
                <TD>{m.org_id ? (orgs?.find(o=>o.id===m.org_id)?.name ?? m.org_id) : 'All'}</TD>
                <TD>{m.subject ?? '—'}</TD>
                <TD className="max-w-[40rem] truncate" title={m.body}>{m.body}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
