// app/api/links/[id]/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/links/:id — update link url
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { url, label } = await req.json()

  if (!url) return NextResponse.json({ error: "URL is required." }, { status: 400 })

  const link = await prisma.link.findUnique({ where: { id } })

  if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 })

  if (link.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  const updated = await prisma.link.update({
    where: { id },
    data: { url, label: label !== undefined ? (label || null) : undefined },
  })

  return NextResponse.json(updated)
}

// DELETE /api/links/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const link = await prisma.link.findUnique({ where: { id } })

  if (!link) return NextResponse.json({ error: "Link not found." }, { status: 404 })

  if (link.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 })
  }

  await prisma.link.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}