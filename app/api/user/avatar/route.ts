// app/api/user/avatar/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// GET /api/user/avatar — get current user's avatar
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  })

  return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null })
}

// POST /api/user/avatar — upload avatar image
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 })

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 })
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 2MB." }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Save to public/avatars/
  const ext = file.type.split("/")[1]
  const filename = `${session.user.id}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "avatars")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  const avatarUrl = `/avatars/${filename}`

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}