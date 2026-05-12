import ExportButton from "./export-button"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

const PLATFORMS = [
    "PHONE",
    "EMAIL",
    "MAPS",
    "INSTAGRAM",
    "FACEBOOK",
    "SNAPCHAT",
    "TIKTOK",
    "WHATSAPP",
    "SITE_WEB",
    "AUTRE"
]

const PLATFORM_ICONS: Record<string, string> = {
  PHONE: "/phone.png",
  EMAIL: "/email.png",
  MAPS: "/maps.png",
  INSTAGRAM: "/instagram.png",
  FACEBOOK: "/facebook.png",
  SNAPCHAT: "/snapchat.png",
  TIKTOK: "/tiktok.png",
  WHATSAPP: "/whatsapp.png",
  SITE_WEB: "/website.png",
  AUTRE: "/link.png"
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { title: "Profile" }
  return { title: `@${user.username}` }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: { links: { orderBy: [{ order: "asc" }, { id: "asc" }] } },
  })

  if (!user) notFound()

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">

      {/* Avatar + username */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-30 h-30 rounded-full flex items-center justify-center text-2xl font-semibold mb-4 overflow-hidden">
          {user.avatarUrl ? (
            <img
              src={`${user.avatarUrl}?t=${Date.now()}`}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
        <h1 className=" text-xl font-semibold">{user.username}</h1>
        <ExportButton
          username={user.username}
          email={user.email}
          links={user.links}
        />
      </div>

      {/* Links */}
      {user.links.length === 0 ? (
        <p className="text-zinc-600 text-sm">Aucun lien disponible.</p>
      ) : (
        <ul className="flex flex-col gap-3 w-full max-w-sm">
          {user.links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4  border border-zinc-800 rounded-xl px-5 py-4 hover:bg-blue-900 hover:text-white hover:border-zinc-700 transition-colors group"
              >
                <Image src={PLATFORMS.includes(link.platform) ? PLATFORM_ICONS[link.platform] : "/link.png"} alt={link.platform} width={24} height={24} />
                <span className="text-sm font-medium flex-1">
                  {link.label ?? (link.platform.charAt(0) + link.platform.slice(1).toLowerCase())}
                </span>
                <span className="text-zinc-600 text-xs group-hover:text-zinc-400 transition-colors">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
