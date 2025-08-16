export default function Audit() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Audit Log</h1>
      <p className="mt-2 text-neutral-700">System and user events for your organization.</p>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
