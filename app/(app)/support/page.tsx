export default function Support() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Support</h1>
      <p className="mt-2 text-neutral-700">Conversations with the platform team.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="overflow-x-auto rounded border shadow-soft">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">Open</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3"><button className="rounded border px-3 py-1">Open</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Thread</div>
          <div className="mt-2 h-48 overflow-auto rounded border p-3 text-sm">—</div>
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_120px]">
            <input className="rounded border px-3 py-2" placeholder="Write a reply…" />
            <button className="rounded border px-3 py-2">Send</button>
          </div>
        </div>
      </div>
    </section>
  )
}
