// app/outbox/page.tsx
'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'

type OutboxRow = {
  id: string
  created_at: string
  to_phone: string
  status: 'QUEUED' | 'SENT' | 'FAILED' | string
  provider_status: string | null
  template_id: string | null
  rendered_text: string | null
}

async function loadOutbox(): Promise<OutboxRow[]> {
  const { data, error } = await supabase
    .from('whatsapp_outbox')
    .select('id, created_at, to_phone, status, provider_status, template_id, rendered_text')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data as OutboxRow[]
}

function StatusChip({ status }: { status: string }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const cls =
    status === 'FAILED'
      ? 'bg-red-100 text-red-700'
      : status === 'SENT'
      ? 'bg-green-100 text-green-700'
      : 'bg-slate-100 text-slate-700'
  return <span className={`${base} ${cls}`}>{status}</span>
}

export default function OutboxPage() {
  const { t } = useI18n()
  const { data, mutate } = useSWR('outbox', loadOutbox)

  // quick send test
  const [to, setTo] = useState('') // E.164
  const [text, setText] = useState('AOOS test message')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function send() {
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
    const org_id = orgs?.[0]?.id
    if (!org_id) return setToast('No org found for this user.')

    setSending(true)
    setToast(null)
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id,
        to_phone: to,
        body: text,
        facts: { Sender: 'PO Manager' },
      }),
    })
    setSending(false)
    const j = await res.json().catch(() => ({}))
    setToast(res.ok ? `OK ${j.provider_message_id ?? ''}` : `Failed: ${j.provider_status ?? ''}`)
    mutate()
  }

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">{t('outbox.title')}</h1>

      {/* Quick send test */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label>{t('outbox.to')}</Label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="+201234567890" />
        </div>
        <div className="sm:col-span-2">
          <Label>{t('outbox.text')}</Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="sm:col-span-3">
          <Button onClick={send} disabled={sending || !to || !text.trim()}>
            {sending ? t('outbox.sending') : t('outbox.sendTest')}
          </Button>
          {toast && <span className="ml-3 text-sm text-slate-600">{toast}</span>}
        </div>
      </div>

      {/* Outbox table */}
      <Table>
        <THead>
          <TR>
            <TH>Time</TH>
            <TH>To</TH>
            <TH>Status</TH>
            <TH>Provider</TH>
            <TH>Preview</TH>
          </TR>
        </THead>
        <TBody>
          {(data ?? []).map((o) => (
            <TR key={o.id}>
              <TD>{new Date(o.created_at!).toLocaleString()}</TD>
              <TD>{o.to_phone}</TD>
              <TD>
                <StatusChip status={o.status} />
              </TD>
              <TD>{o.provider_status ?? '-'}</TD>
              <TD className="max-w-[24rem] truncate" title={o.rendered_text ?? ''}>
                {o.rendered_text ?? '-'}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
