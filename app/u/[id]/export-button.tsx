"use client"

type Link = { platform: string; url: string; label: string | null; order: number }

export default function ExportButton({ username, email, links }: {
  username: string
  email: string
  links: Link[]
}) {


function handleExportVCard() {

  const phoneLink = links.find((l) => l.platform === "PHONE")
  const emailLink = links.find((l) => l.platform === "EMAIL")

  const urlLinks = links.filter((l) => l.platform !== "PHONE" && l.platform !== "EMAIL")

  console.log(links);

  const vcardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${username}`,
    `EMAIL:${emailLink ? emailLink.url.replace("mailto:", "") : email}`,
    ...(phoneLink ? [`TEL:${phoneLink.url.replace("tel:", "")}`] : []),
    ...urlLinks.map((l) => `URL;type=${l.platform}:${l.url}`),
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
      onClick={handleExportVCard}
      className="mt-8 text-zinc-400 text-sm hover:text-white hover:bg-blue-900 transition-colors border border-zinc-800 rounded-lg px-4 py-2 cursor-pointer"
    >
      Enregister Contact
    </button>
  )
}