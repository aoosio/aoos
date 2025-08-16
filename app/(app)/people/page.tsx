export default function People() {
  return (
    <section>
      <h1 className="text-xl font-semibold">People</h1>
      <p className="mt-2 text-neutral-700">Invite and manage organization members.</p>

      <form className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_120px]">
        <input className="rounded border px-3 py-2" placeholder="Email" />
        <select className="rounded border px-3 py-2">
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="PO_MANAGER">PO Manager</option>
        </select>
        <button className="rounded bg-brand px-3 py-2 text-white">Invite</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Added</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><button className="rounded border px-3 py-1">Remove</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
