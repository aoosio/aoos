export default function AdminOverview() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-neutral-700">Platform‑wide stats (platform admins only).</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Organizations</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Owners</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">POs</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Suggestion</th>
              <th className="px-4 py-2">Accepted %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
