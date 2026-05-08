import { requireAdmin } from "@/lib/require-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}