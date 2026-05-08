"use client"

// app/admin/page.tsx

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

type User = {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
  _count: { links: number }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState("")

  // Create form
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "USER" })

  // Modify modal
  const [modifyUser, setModifyUser] = useState<User | null>(null)
  const [modifyForm, setModifyForm] = useState({ username: "", email: "", password: "", role: "USER" })
  const [modifyError, setModifyError] = useState("")
  const [modifyLoading, setModifyLoading] = useState(false)

  // NFC
  const [nfcStatus, setNfcStatus] = useState<{ userId: string; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setFetching(false) })
  }, [])

  // ── Create ──────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setFormLoading(false)

    if (!res.ok) { setFormError(data.error ?? "Failed to create user."); return }

    setUsers((prev) => [...prev, data])
    setForm({ username: "", email: "", password: "", role: "USER" })
    setShowForm(false)
  }

  // ── Delete ───────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this user and all their links?")) return
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  // ── Modify ───────────────────────────────────────────────
  function openModify(user: User) {
    setModifyUser(user)
    setModifyForm({ username: user.username, email: user.email, password: "", role: user.role })
    setModifyError("")
  }

  async function handleModifySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!modifyUser) return
    setModifyError("")
    setModifyLoading(true)

    const body: Record<string, string> = {
      username: modifyForm.username,
      email: modifyForm.email,
      role: modifyForm.role,
    }
    if (modifyForm.password) body.password = modifyForm.password

    const res = await fetch(`/api/admin/users/${modifyUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setModifyLoading(false)

    if (!res.ok) { setModifyError(data.error ?? "Failed to update user."); return }

    setUsers((prev) => prev.map((u) => u.id === modifyUser.id ? { ...u, ...data } : u))
    setModifyUser(null)
  }

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Admin panel</h1>
            <p className="text-zinc-500 text-sm">Signed in as {session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="bg-blue-900 text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors"
            >
              {showForm ? "Cancel" : "+ New user"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-zinc-500 text-sm hover:text-zinc-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Create user form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border border-zinc-800 rounded-xl p-5 mb-8 flex flex-col gap-3">
            <p className="text-zinc-900 text-sm font-medium mb-1">Create new user</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Username"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-white border border-zinc-800 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
              />
              <input
                placeholder="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white border border-zinc-800 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
              />
              <input
                placeholder="Password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-white border border-zinc-800 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-white border border-zinc-800 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {formError && <p className="text-red-400 text-sm">{formError}</p>}
            <button
              type="submit"
              disabled={formLoading}
              className="bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 w-full mt-1"
            >
              {formLoading ? "Creating..." : "Create user"}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-800 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600 mb-4"
        />

        {/* Users table */}
        {fetching ? (
          <p className="text-zinc-600 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-600 text-sm">No users found.</p>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-white">
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">User</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Role</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Links</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} className={`border-b border-zinc-800 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}>
                    <td className="px-4 py-3">
                      <p className="text-zinc-900 font-medium">@{user.username}</p>
                      <p className="text-zinc-500 text-xs">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        user.role === "ADMIN" ? "bg-amber-400 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{user._count.links}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== session?.user?.id && (
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => openModify(user)}
                            className="text-zinc-500 hover:text-blue-400 transition-colors text-xs"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modify modal */}
      {modifyUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-zinc-900 font-semibold">Modify @{modifyUser.username}</h2>
              <button onClick={() => setModifyUser(null)} className="text-zinc-400 hover:text-zinc-900 text-lg">✕</button>
            </div>

            <form onSubmit={handleModifySubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Username</label>
                <input
                  required
                  value={modifyForm.username}
                  onChange={(e) => setModifyForm({ ...modifyForm, username: e.target.value })}
                  className="bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={modifyForm.email}
                  onChange={(e) => setModifyForm({ ...modifyForm, email: e.target.value })}
                  className="bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">New password <span className="normal-case text-zinc-400">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  minLength={8}
                  placeholder="••••••••"
                  value={modifyForm.password}
                  onChange={(e) => setModifyForm({ ...modifyForm, password: e.target.value })}
                  className="bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Role</label>
                <select
                  value={modifyForm.role}
                  onChange={(e) => setModifyForm({ ...modifyForm, role: e.target.value })}
                  className="bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {modifyError && <p className="text-red-400 text-sm">{modifyError}</p>}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModifyUser(null)}
                  className="flex-1 border border-zinc-300 text-zinc-600 rounded-lg py-2.5 text-sm hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modifyLoading}
                  className="flex-1 bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {modifyLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}