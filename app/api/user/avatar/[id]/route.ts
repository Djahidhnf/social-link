import { NextResponse } from "next/server"
import { head } from "@vercel/blob"
import { auth } from "@/lib/auth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const url = `https://${process.env.BLOB_STORE_ID}.private.blob.vercel-storage.com/avatars/${id}`
  
  const { downloadUrl } = await head(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
  
  return NextResponse.redirect(downloadUrl)
}