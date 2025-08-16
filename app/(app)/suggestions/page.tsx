export default function Suggestions() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Suggestions</h1>
      <p className="mt-2 text-neutral-700">Review and act on purchase suggestions.</p>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Recommended Qty</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><span className="rounded bg-neutral-100 px-2 py-0.5">—</span></td>
              <td className="px-4 py-3"><button className="rounded border px-3 py-1">Approve</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
