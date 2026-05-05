"use client"

// app/(auth)/login/page.tsx

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError("Invalid email or password.")
      return
    }

    // Check role and redirect accordingly
    const sessionRes = await fetch("/api/auth/session")
    const session = await sessionRes.json()

    if (session?.user?.role === "ADMIN") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center text-black bg-white px-4">
      <div className="w-full max-w-sm">

        <h1 className="text-3xl font-semibold mb-10">Ce connecter</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className=" border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className=" border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 text-white font-medium rounded-lg py-2.5 text-sm mt-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ce connecter..." : "Ce connecter"}
          </button>
        </form>
      </div>
    </main>
  )
}