import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("Admin123!", 12)

  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@gmail.com",
      password,
      role: "ADMIN",
    },
  })

  console.log("Admin user created: admin@gmail.com / Admin123!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())