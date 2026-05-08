import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log('BLOB TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'exists' : 'missing')
  console.log('TOKEN VALUE:', process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20))
  
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File
  console.log('FILE:', file?.name, file?.size, file?.type)

  try {
    const blob = await put(`avatars/${session.user.id}`, file, {
      access: "public",
      addRandomSuffix: false,
    })
    console.log('BLOB URL:', blob.url)
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: blob.url },
    })

    return NextResponse.json({ avatarUrl: blob.url })
  } catch (err) {
    console.error('BLOB ERROR:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}