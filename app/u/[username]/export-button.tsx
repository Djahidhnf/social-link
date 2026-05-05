"use client"

type Link = { platform: string; url: string }

export default function ExportButton({ username, email, links }: {
  username: string
  email: string
  links: Link[]
}) {
  function handleExport() {
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
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${username}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="mt-8 text-zinc-400 text-sm hover:text-white hover:bg-blue-900 transition-colors border border-zinc-800 rounded-lg px-4 py-2"
    >
      Extraire Contact
    </button>
  )
}