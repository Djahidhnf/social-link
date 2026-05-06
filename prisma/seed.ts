import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("BilalAntic123!", 12)

  await prisma.user.upsert({
    where: { email: "Bilal@antic-tech.com" },
    update: {},
    create: {
      username: "admin",
      email: "Bilal@antic-tech.com",
      password,
      role: "ADMIN",
    },
  })

  console.log("Admin user created: Bilal@antic-tech.com / BilalAntic123!");
}