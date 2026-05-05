// app/api/register/route.ts

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })

    if (existing) {
      const field = existing.email === email ? "Email" : "Username"
      return NextResponse.json({ error: `${field} is already taken.` }, { status: 409 })
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: { username, email, password: hashedPassword },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}