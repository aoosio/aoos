'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UploadsPage() {
  return (
    <Card>
      <h1 className="mb-2 text-lg font-semibold">Uploads</h1>
      <p className="mb-4 text-sm text-slate-600">Upload your Sales and Stock CSVs. (This MVP shows the UI shell; file handling is wired in the backend ingest process.)</p>
      <div className="flex gap-3">
        <Button variant="secondary">Upload Sales CSV</Button>
        <Button variant="secondary">Upload Stock CSV</Button>
        <a className="text-brand-700 text-sm" href="/AOOS_Sales_Template.csv" download>Download Sales template</a>
        <a className="text-brand-700 text-sm" href="/AOOS_Stock_Template.csv" download>Download Stock template</a>
      </div>
    </Card>
  )
}