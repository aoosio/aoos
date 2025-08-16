import Link from 'next/link'

export default function PurchaseOrders() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Purchase Orders</h1>
        <Link href="/pos/new" className="rounded bg-brand px-3 py-1.5 text-sm text-white">New PO</Link>
      </div>
      <p className="mt-2 text-neutral-700">Track, approve and dispatch POs.</p>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">PO #</th>
              <th className="px-4 py-2">Supplier</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><span className="rounded bg-neutral-100 px-2 py-0.5">—</span></td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><Link href="/pos/00000000" className="underline">View</Link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
