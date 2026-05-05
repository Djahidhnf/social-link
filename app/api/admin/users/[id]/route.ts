// app/api/admin/users/[id]/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// PATCH /api/admin/users/:id — update username, email, password, role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot modify your own account." }, { status: 400 })
  }

  const { username, email, password, role } = await req.json()

  // Check for duplicate username/email on a different user
  if (username || email) {
    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { OR: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])] },
        ],
      },
    })
    if (existing) {
      const field = existing.username === username ? "Username" : "Email"
      return NextResponse.json({ error: `${field} is already taken.` }, { status: 409 })
    }
  }

  const updateData: Record<string, any> = {}
  if (username) updateData.username = username
  if (email) updateData.email = email
  if (role) updateData.role = role === "ADMIN" ? "ADMIN" : "USER"
  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }
    updateData.password = await bcrypt.hash(password, 12)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { links: true } },
    },
  })

  return NextResponse.json(user)
}

// DELETE /api/admin/users/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}