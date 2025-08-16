// app/team/page.tsx
'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

type Org = { id: string }
type Invite = {
  id: string
  org_id: string
  email: string
  role: 'po_manager' | 'owner'
  token: string
  created_at: string
}
type Member = { user_id: string; role: 'owner' | 'po_manager'; added_at?: string | null }

async function getOrg(): Promise<Org | null> {
  const { data, error } = await supabase.from('organizations').select('id').maybeSingle()
  if (error) return null
  return data as Org | null
}

async function loadInvites(): Promise<Invite[]> {
  const org = await getOrg()
  if (!org) return []
  const { data, error } = await supabase
    .from('org_invites')
    .select('id,org_id,email,role,token,created_at')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Invite[]
}

async function loadMembers(): Promise<Member[]> {
  const org = await getOrg()
  if (!org) return []
  const { data, error } = await supabase
    .from('org_members')
    .select('user_id,role,added_at')
    .eq('org_id', org.id)
    .order('added_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Member[]
}

export default function TeamPage() {
  const [org, setOrg] = useState<Org | null>(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    getOrg().then(setOrg)
  }, [])

  const { data: invites, mutate: refetchInvites } = useSWR('invites', loadInvites)
  const { data: members, mutate: refetchMembers } = useSWR('members', loadMembers)

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    const clean = email.trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setMsg('Enter a valid email.')
      return
    }

    setBusy(true)
    setMsg(null)

    // 1) Prevent duplicate pending invite for this email
    const { data: existing, error: exErr } = await supabase
      .from('org_invites')
      .select('id')
      .eq('org_id', org.id)
      .eq('email', clean)
      .maybeSingle()

    if (exErr) {
      setBusy(false)
      setMsg(exErr.message)
      return
    }
    if (existing) {
      setBusy(false)
      setMsg('Invite already exists for this email.')
      return
    }

    // 2) Create invite
    const { data, error } = await supabase
      .from('org_invites')
      .insert({
        org_id: org.id,
        email: clean,
        role: 'po_manager',
      })
      .select('token')
      .maybeSingle()

    setBusy(false)
    if (error) {
      setMsg(error.message)
      return
    }

    // Optional: copy invite link to clipboard
    const url = `${location.origin}/invite/${data?.token}`
    try {
      await navigator.clipboard.writeText(url)
      setMsg('Invite created. Link copied to clipboard.')
    } catch {
      setMsg(`Invite created. Share this link: ${url}`)
    }
    setEmail('')
    refetchInvites()
  }

  async function cancelInvite(id: string) {
    if (!org) return
    setBusy(true); setMsg(null)
    const { error } = await supabase.from('org_invites').delete().eq('id', id).eq('org_id', org.id)
    setBusy(false)
    setMsg(error ? error.message : 'Invite cancelled.')
    refetchInvites()
  }

  async function removeMember(user_id: string) {
    if (!org) return
    setBusy(true); setMsg(null)
    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('org_id', org.id)
      .eq('user_id', user_id)
      .neq('role', 'owner') // safety: don’t remove owners via this button
    setBusy(false)
    setMsg(error ? error.message : 'Member removed.')
    refetchMembers()
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">Team</h1>
        <form onSubmit={sendInvite} className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="email">Invite PO manager (email)</Label>
            <Input
              id="email"
              type="email"
              placeholder="person@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy || !email.trim()}>
              {busy ? 'Working…' : 'Send invite'}
            </Button>
          </div>
          {msg && <div className="sm:col-span-3 text-sm text-slate-700">{msg}</div>}
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-semibold">Pending invites</h2>
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Created</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {(invites ?? []).length === 0 && (
              <TR><TD colSpan={4} className="text-slate-500">No pending invites.</TD></TR>
            )}
            {(invites ?? []).map((i) => (
              <TR key={i.id}>
                <TD>{i.email}</TD>
                <TD>{i.role}</TD>
                <TD>{new Date(i.created_at).toLocaleString()}</TD>
                <TD className="text-right">
                  <Button variant="secondary" onClick={() => cancelInvite(i.id)}>Cancel</Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>

      <Card>
        <h2 className="mb-2 text-base font-semibold">Members</h2>
        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Role</TH>
              <TH>Added</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {(members ?? []).length === 0 && (
              <TR><TD colSpan={4} className="text-slate-500">No members yet.</TD></TR>
            )}
            {(members ?? []).map((m) => (
              <TR key={m.user_id}>
                <TD className="truncate max-w-[20rem]">{m.user_id}</TD>
                <TD>{m.role}</TD>
                <TD>{m.added_at ? new Date(m.added_at).toLocaleString() : '-'}</TD>
                <TD className="text-right">
                  {m.role !== 'owner' && (
                    <Button variant="secondary" onClick={() => removeMember(m.user_id)}>
                      Remove
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
