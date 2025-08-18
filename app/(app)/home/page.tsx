'use client'
export default function Home() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Home</h1>
      <p className="mt-2 text-neutral-700">Overview and quick actions.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Open inquiries</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Pending suggestions</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Failed sends</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="mt-8 rounded border p-4 shadow-soft">
        <h2 className="font-semibold">Next actions</h2>
        <ul className="mt-2 list-disc pl-6 text-sm text-neutral-700">
          <li>Review latest suggestions</li>
          <li>Check WhatsApp outbox failures</li>
          <li>Upload recent sales/stock CSVs</li>
        </ul>
      </div>
    </section>
  )
}
