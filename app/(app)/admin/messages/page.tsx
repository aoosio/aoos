export default function AdminMessages() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Platform Inbox</h1>
      <p className="mt-2 text-neutral-700">Broadcast announcements or message a specific org.</p>

      <form className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded border p-4 shadow-soft">
          <h2 className="font-semibold">New message</h2>
          <div className="mt-3 grid gap-2">
            <input className="rounded border px-3 py-2" placeholder="Subject" />
            <textarea className="h-28 rounded border p-2" placeholder="Body…"></textarea>
            <select className="rounded border px-3 py-2">
              <option value="ALL">All organizations</option>
              <option value="ORG">Specific organization…</option>
            </select>
            <button className="rounded bg-brand px-3 py-2 text-white">Send</button>
          </div>
        </div>

        <div className="overflow-x-auto rounded border p-4 shadow-soft">
          <h2 className="font-semibold">Recent</h2>
          <table className="mt-3 min-w-full text-sm">
            <thead className="bg-neutral-50 text-left">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Audience</th>
                <th className="px-4 py-2">Subject</th>
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
      </form>
    </section>
  )
}
