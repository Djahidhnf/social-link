// app/api/links/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/links — fetch current user's links
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "asc" },
  })

  return NextResponse.json(links)
}

// POST /api/links — add a new link
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { platform, url } = await req.json()

  if (!platform || !url) {
    return NextResponse.json({ error: "Platform and URL are required." }, { status: 400 })
  }

  const link = await prisma.link.create({
    data: {
      platform,
      url,
      userId: session.user.id,
    },
  })

  return NextResponse.json(link, { status: 201 })
}