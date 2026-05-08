const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('BilalAntic123!', 12)

  await prisma.user.upsert({
    where: { email: 'bilal@antic-tech.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'bilal@antic-tech.com',
      password,
      role: 'ADMIN',
    },
  })

  console.log('Admin created: bilal@antic-tech.com / BilalAntic123!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())