export default function Suppliers() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <button className="rounded bg-brand px-3 py-1.5 text-sm text-white">Add supplier</button>
      </div>
      <p className="mt-2 text-neutral-700">Manage supplier records and contacts.</p>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">WhatsApp</th>
              <th className="px-4 py-2">Contacts</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><button className="rounded border px-3 py-1">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
