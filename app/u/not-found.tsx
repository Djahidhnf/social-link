// app/u/[username]/not-found.tsx

import Link from "next/link"

export default function ProfileNotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <p className="text-zinc-600 text-5xl mb-4">404</p>
      <p className="text-white text-lg font-medium mb-2">Profile not found</p>
      <p className="text-zinc-500 text-sm mb-8">This user doesn't exist or has been deactivated.</p>
      <Link href="/" className="text-zinc-400 text-sm hover:text-white transition-colors">
        ← Go home
      </Link>
    </main>
  )
}