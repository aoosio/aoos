'use client'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

async function loadTemplates() {
  const { data, error } = await supabase
    .from('message_templates')
    .select('id, key, language_code, status, body, facts_config, updated_at')
    .order('key', { ascending: true })
  if (error) throw error
  return data
}

export default function TemplatesPage() {
  const { data, mutate } = useSWR('templates', loadTemplates)

  async function saveBody(id: string, body: string) {
    const { error } = await supabase.from('message_templates').update({ body }).eq('id', id)
    if (error) alert(error.message)
    else mutate()
  }

  return (
    <div className="grid gap-6">
      <Card>
        <h1 className="text-lg font-semibold">Templates (Owner)</h1>
        <p className="text-sm text-slate-600">Edit only the intro body. AOOS appends the immutable Facts block and signature automatically.</p>
      </Card>

      {(data ?? []).map(t => (
        <Card key={t.id}>
          <div className="mb-2 text-sm text-slate-500">{t.key} — {t.language_code.toUpperCase()} — {t.status}</div>
          <Textarea defaultValue={t.body} id={`body-${t.id}`} rows={3} />
          <div className="mt-2 flex gap-2">
            <Button onClick={() => saveBody(t.id, (document.getElementById(`body-${t.id}`) as HTMLTextAreaElement).value)}>Save</Button>
            <div className="text-xs text-slate-500 ml-auto">Updated: {t.updated_at ? new Date(t.updated_at).toLocaleString() : '-'}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}