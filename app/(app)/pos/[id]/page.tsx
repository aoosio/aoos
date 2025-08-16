type Props = { params: { id: string } }

export default function POView({ params }: Props) {
  const { id } = params
  return (
    <section>
      <h1 className="text-xl font-semibold">Purchase Order #{id}</h1>
      <p className="mt-2 text-neutral-700">Supplier, items and status.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Supplier</div>
          <div className="mt-1">—</div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Status</div>
          <div className="mt-1"><span className="rounded bg-neutral-100 px-2 py-0.5">—</span></div>
        </div>
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Promised date</div>
          <div className="mt-1">—</div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Price</th>
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

      <div className="mt-6 flex gap-2">
        <button className="rounded border px-3 py-1.5">Approve</button>
        <button className="rounded border px-3 py-1.5">Dispatch</button>
        <button className="rounded border px-3 py-1.5">Mark delivered</button>
      </div>
    </section>
  )
}
