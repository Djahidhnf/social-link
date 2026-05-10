// app/api/user/avatar/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

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

  // Configure inside the function so env vars are loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const formData = await req.formData()
  const file = formData.get("avatar") as File

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image." }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 2MB." }, { status: 400 })

  try {
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "procard/avatars",
      public_id: session.user.id,
      overwrite: true,
      invalidate: true,
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: result.secure_url },
    })

    return NextResponse.json({ avatarUrl: result.secure_url })
  } catch (err) {
    console.error("Cloudinary error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}