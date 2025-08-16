export default function Outbox() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Outbox</h1>
      <p className="mt-2 text-neutral-700">WhatsApp message log & delivery status.</p>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Template</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><span className="rounded bg-neutral-100 px-2 py-0.5">—</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded border p-4 shadow-soft">
        <h2 className="font-semibold">Quick send (test)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-[2fr_1fr_120px]">
          <input className="rounded border px-3 py-2" placeholder="WhatsApp phone (+…)" />
          <input className="rounded border px-3 py-2" placeholder="Template key" />
          <button className="rounded border px-3 py-2">Send</button>
        </div>
      </div>
    </section>
  )
}
