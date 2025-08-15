'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'

async function loadSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name, preferred_language, updated_at')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export default function SuppliersPage() {
  const { data, mutate } = useSWR('suppliers', loadSuppliers)

  async function addSupplier(formData: FormData) {
    const name = String(formData.get('name') || '')
    if (!name) return
    const { error } = await supabase.from('suppliers').insert({ name })
    if (error) alert(error.message)
    await mutate()
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="mb-3 text-lg font-semibold">Suppliers</h1>
        <form action={addSupplier} className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Supplier name" />
          </div>
          <div className="flex items-end"><Button type="submit">Add</Button></div>
        </form>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR><TH>Name</TH><TH>Language</TH><TH>Updated</TH></TR>
          </THead>
          <TBody>
            {(data ?? []).map((s) => (
              <TR key={s.id}>
                <TD>{s.name}</TD>
                <TD>{s.preferred_language?.toUpperCase() ?? '-'}</TD>
                <TD>{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}