import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true },
  })

  return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File
  console.log('file:', file?.name, file?.size)

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image." }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 2MB." }, { status: 400 })

  const blob = await put(`avatars/${session.user.id}`, file, {
    access: "public",
    token: process.env.a71dd0c3af9fa5474c283f0a_READ_WRITE_TOKEN,
  })


  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: blob.url },
  })

  return NextResponse.json({ avatarUrl: blob.url })
}