'use client'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Msg = { id: string; created_at: string; subject: string | null; body: string }
type Reply = { id: string; created_at: string; body: string; user_id: string }

async function loadMsgs(): Promise<Msg[]> {
  const { data, error } = await supabase.from('admin_messages')
    .select('id,created_at,subject,body,org_id')
    .order('created_at',{ascending:false}).limit(50)
  if (error) throw error
  // RLS already filters to my org or broadcast
  return data as any
}

async function loadReplies(message_id: string): Promise<Reply[]> {
  const { data, error } = await supabase.from('admin_message_replies')
    .select('id,created_at,body,user_id').eq('message_id', message_id).order('created_at')
  if (error) throw error
  return data as any
}

export default function SupportPage() {
  const { data: msgs } = useSWR('support-msgs', loadMsgs)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    if (!activeId) return
    loadReplies(activeId).then(setReplies)
  }, [activeId])

  async function send() {
    if (!activeId || !text.trim()) return
    const { error } = await supabase.from('admin_message_replies').insert({ message_id: activeId, body: text })
    if (!error) { setText(''); loadReplies(activeId).then(setReplies) }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">Support</h1>
        <Table>
          <THead><TR><TH>Time</TH><TH>Subject</TH><TH>Message</TH><TH></TH></TR></THead>
          <TBody>
            {(msgs ?? []).map(m => (
              <TR key={m.id}>
                <TD>{new Date(m.created_at).toLocaleString()}</TD>
                <TD>{m.subject ?? '—'}</TD>
                <TD className="max-w-[36rem] truncate" title={m.body}>{m.body}</TD>
                <TD className="text-right">
                  <Button variant="secondary" onClick={()=>setActiveId(m.id)}>Open</Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      {activeId && (
        <Card>
          <h2 className="mb-2 text-base font-semibold">Conversation</h2>
          <div className="space-y-2">
            {replies.map(r => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-2">
                <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
                <div className="text-sm">{r.body}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a reply…" />
            <Button onClick={send} disabled={!text.trim()}>Send</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
