"use client"

// app/dashboard/page.tsx

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
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
    "AVIS",
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
  AVIS: "/review.png",
  AUTRE: "/link.png"
}

// Platforms where user enters raw value (not a URL)
const RAW_INPUT_PLATFORMS = ["PHONE", "EMAIL"]

// Placeholder text per platform
const PLACEHOLDERS: Record<string, string> = {
  PHONE: "e.g. 0612345678",
  EMAIL: "e.g. you@example.com",
  DEFAULT: "https://...",
}

type Link = { id: string; platform: string; url: string }

export default function DashboardPage() {
  const { data: session } = useSession()
  const [links, setLinks] = useState<Link[]>([])
  const [platform, setPlatform] = useState("INSTAGRAM")
  const [platformName, setPlatformName] = useState("");
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((data) => { setLinks(data); setFetching(false) })

    fetch("/api/user/avatar")
      .then((r) => r.json())
      .then((data) => setAvatar(data.avatarUrl ?? null))
  }, [])

  // Format raw input into proper URL for storage
  function formatUrl(platform: string, value: string): string {
    if (platform === "PHONE") return `tel:${value.replace(/\s/g, "")}`
    if (platform === "EMAIL") return `mailto:${value.trim()}`
    return value
  }

  // Display stored URL as human-readable value
  function displayValue(platform: string, url: string): string {
    if (platform === "PHONE") return url.replace("tel:", "")
    if (platform === "EMAIL") return url.replace("mailto:", "")
    return url
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    const formData = new FormData()
    formData.append("avatar", file)
    const res = await fetch("/api/user/avatar", { method: "POST", body: formData })
    const data = await res.json()
    setAvatarLoading(false)
    if (res.ok) setAvatar(data.avatarUrl)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formattedUrl = formatUrl(platform, url)

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: platform === "AUTRE" ? platformName : platform, url: formattedUrl }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Failed to add link."); return }

    setLinks((prev) => [...prev, data])
    setUrl("")
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" })
    if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  function startEdit(link: Link) {
    setEditingId(link.id)
    setEditValue(displayValue(link.platform, link.url))
    setEditError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue("")
    setEditError("")
  }

  async function handleEditSave(link: Link) {
    setEditError("")
    setEditLoading(true)

    const formattedUrl = formatUrl(link.platform, editValue)

    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: formattedUrl }),
    })

    const data = await res.json()
    setEditLoading(false)

    if (!res.ok) { setEditError(data.error ?? "Failed to update link."); return }

    setLinks((prev) => prev.map((l) => l.id === link.id ? { ...l, url: formattedUrl } : l))
    setEditingId(null)
  }

  function handleExportVCard() {
    const username = session?.user?.username ?? "user"
    const email = session?.user?.email ?? ""

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${username}`,
      `EMAIL:${email}`,
      ...links.map((l) => {
        const label = l.platform.charAt(0) + l.platform.slice(1).toLowerCase()
        return `URL;type=${label}:${l.url}`
      }),
      "END:VCARD",
    ]

    const blob = new Blob([vcardLines.join("\n")], { type: "text/vcard" })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = `${username}.vcf`
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  const isRaw = RAW_INPUT_PLATFORMS.includes(platform)

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div
              className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar ? (
                <img src={`/api/user/avatar/${session?.user?.id}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className=" text-xl font-semibold">
                  {session?.user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className=" text-xs">{avatarLoading ? "..." : "Edit"}</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <h1 className="text-xl font-semibold ">{session?.user?.username}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-zinc-500 text-sm hover:text-black transition-colors"
            >
              Ce déconnecter
            </button>
          </div>
        </div>

        {/* Add link form */}
        <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-10">
          <select
            value={platform}
            onChange={(e) => { setPlatform(e.target.value); setUrl("") }}
            className="bg-white border border-zinc-800  rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {platform === "AUTRE" && (
            <input
              type="text"
              placeholder="Nom de la plateforme (e.g. LinkedIn)"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="bg-white border border-zinc-800  rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
            />
          )}

          <div className="flex gap-2">
            <input
              required
              type={platform === "EMAIL" ? "email" : platform === "PHONE" ? "tel" : "url"}
              placeholder={PLACEHOLDERS[platform] ?? PLACEHOLDERS.DEFAULT}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-white border border-zinc-800  rounded-lg px-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 text-white font-medium rounded-lg px-5 py-2.5 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Ajouter"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        {/* Links list */}
        {fetching ? (
          <p className="text-zinc-600 text-sm">Loading...</p>
        ) : links.length === 0 ? (
          <p className="text-zinc-600 text-sm">Aucun lien créé. Ajoutez-en un ci-dessus.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.id} className="flex flex-col bg-white border border-zinc-800 rounded-lg px-4 py-3 gap-2">
                <div className="flex items-center gap-3">
                  <Image src={PLATFORM_ICONS[link.platform] ?? "/link.png"} alt={link.platform} width={24} height={24} />
                  <div className="flex-1 min-w-0">
                    <p className=" text-sm font-medium">
                      {link.platform.charAt(0) + link.platform.slice(1).toLowerCase()}
                    </p>
                    {editingId !== link.id && (
                      <p className="text-zinc-500 text-xs truncate">{displayValue(link.platform, link.url)}</p>
                    )}
                  </div>
                  {editingId !== link.id && (
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => startEdit(link)}
                        className="text-zinc-600 hover:text-blue-400 transition-colors text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline edit input */}
                {editingId === link.id && (
                  <div className="flex flex-col gap-2">
                    <input
                      autoFocus
                      type={link.platform === "EMAIL" ? "email" : link.platform === "PHONE" ? "tel" : "url"}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={PLACEHOLDERS[link.platform] ?? PLACEHOLDERS.DEFAULT}
                      className="bg-white border border-zinc-700  rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600"
                    />
                    {editError && <p className="text-red-400 text-xs">{editError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(link)}
                        disabled={editLoading}
                        className="bg-white text-zinc-950 font-medium rounded-lg px-4 py-1.5 text-xs hover:bg-zinc-100 transition-colors disabled:opacity-50"
                      >
                        {editLoading ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-zinc-500 text-xs hover: transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {links.length > 0 && (
          <a
            href={`/u/${encodeURIComponent(session?.user?.username ?? "")}`}
            target="_blank"
            className="block text-center text-zinc-500 text-sm mt-8 hover: transition-colors"
          >
            Profil public →
          </a>
        )}
      </div>
    </main>
  )
}