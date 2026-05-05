// app/api/admin/users/route.ts

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// GET /api/admin/users — fetch all users
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { links: true } },
    },
  })

  return NextResponse.json(users)
}

// POST /api/admin/users — create a new user
export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { username, email, password, role } = await req.json()

  if (!username || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existing) {
    const field = existing.email === email ? "Email" : "Username"
    return NextResponse.json({ error: `${field} is already taken.` }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "USER",
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { links: true } },
    },
  })

  return NextResponse.json(user, { status: 201 })
}