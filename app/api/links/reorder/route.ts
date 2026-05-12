import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/links/reorder — set order for all of the user's links
export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { ids } = await req.json()

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array." }, { status: 400 })
  }

  await prisma.$transaction(
    ids.map((id: string, index: number) =>
      prisma.link.updateMany({
        where: { id, userId: session.user.id },
        data: { order: index },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
