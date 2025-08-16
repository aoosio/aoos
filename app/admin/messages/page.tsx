// app/admin/messages/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export default function AdminMessagesPage() {
  const [audience, setAudience] = useState<'all' | 'org'>('all')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function send() {
    if (!text.trim()) { setToast('Enter a message'); return }
    if (audience === 'org' && !orgId) { setToast('Enter org id'); return }

    setSending(true); setToast(null)
    try {
      // Adjust table/columns to your schema; this assumes `admin_messages`
      const payload: any = { body: text }
      if (audience === 'org') payload.org_id = orgId ?? null

      const { error } = await supabase.from('admin_messages').insert(payload)
      if (error) throw error

      setToast('Sent.')
      setText('')
    } catch (e: any) {
      setToast(e.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">Admin messages</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>Audience</Label>
          <Select value={audience} onChange={(e) => setAudience(e.target.value as 'all' | 'org')}>
            <option value="all">All orgs</option>
            <option value="org">Single org</option>
          </Select>
        </div>

        {audience === 'org' && (
          <div className="sm:col-span-2">
            <Label>Org ID</Label>
            <Input
              value={orgId ?? ''}
              onChange={(e) => setOrgId(e.target.value || null)}
              placeholder="Organization UUID"
            />
          </div>
        )}

        <div className="sm:col-span-3">
          <Label>Message</Label>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to send…" />
        </div>

        <div className="sm:col-span-3">
          <Button onClick={send} disabled={sending || !text.trim() || (audience === 'org' && !orgId)}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
          {toast && <span className="ml-3 text-sm text-slate-600">{toast}</span>}
        </div>
      </div>
    </Card>
  )
}
