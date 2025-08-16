'use client'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Org = { id: string }
type Member = { user_id: string; email: string | null; role: 'owner'|'po_manager'; created_at: string }

async function loadOrg(): Promise<Org | null> {
  const { data } = await supabase.from('organizations').select('id').limit(1)
  return data?.[0] ?? null
}
async function loadMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from('org_members')
    .select('user_id,email,role,created_at').order('created_at',{ascending:true})
  if (error) throw error
  return data as Member[]
}

export default function PeoplePage() {
  const [org, setOrg] = useState<Org | null>(null)
  useEffect(() => { loadOrg().then(setOrg) }, [])

  const { data: members, mutate } = useSWR(org ? `members:${org.id}` : null, loadMembers)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'po_manager'|'owner'>('po_manager')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  async function invite() {
    if (!org) return
    if (!email.trim()) { setToast('Enter email'); return }
    setBusy(true); setToast(null)
    const res = await fetch('/api/members/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, org_id: org.id, role })
    })
    setBusy(false)
    if (!res.ok) setToast(await res.text())
    else { setToast('Invite sent.'); setEmail(''); mutate() }
  }

  async function remove(user_id: string) {
    if (!org) return
    setBusy(true); setToast(null)
    const res = await fetch('/api/members/remove', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org_id: org.id, user_id })
    })
    setBusy(false)
    if (!res.ok) setToast(await res.text())
    else { setToast('Removed.'); mutate() }
  }

  return (
    <Card>
      <h1 className="mb-3 text-lg font-semibold">People</h1>

      {/* Invite */}
      <div className="mb-4 grid items-end gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm">Email</label>
          <Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="user@store.com" />
        </div>
        <div>
          <label className="mb-1 block text-sm">Role</label>
          <Select value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="po_manager">PO Manager</option>
            <option value="owner">Owner</option>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Button onClick={invite} disabled={busy || !email.trim()}>{busy ? 'Sending…' : 'Invite'}</Button>
          {toast && <span className="ml-3 text-sm text-slate-600">{toast}</span>}
        </div>
      </div>

      {/* Members table */}
      <Table>
        <THead>
          <TR><TH>Email</TH><TH>Role</TH><TH>Added</TH><TH></TH></TR>
        </THead>
        <TBody>
          {(members ?? []).map(m => (
            <TR key={m.user_id}>
              <TD>{m.email ?? m.user_id}</TD>
              <TD>{m.role}</TD>
              <TD>{new Date(m.created_at).toLocaleString()}</TD>
              <TD className="text-right">
                <Button variant="secondary" onClick={()=>remove(m.user_id)}>Remove</Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
