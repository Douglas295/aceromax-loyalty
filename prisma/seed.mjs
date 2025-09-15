import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function run() {
  console.log('Seeding database...')

  // Clear existing minimal data for idempotency (safe for dev)
  await prisma.adminLog.deleteMany()
  await prisma.pointsTransaction.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()

  const branch = await prisma.branch.create({
    data: {
      name: 'Aceromax - Branch 1',
      address: 'Main St 123, MX',
    },
  })

  const superadmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@aceromax.mx',
      phone: '5550000001',
      role: Role.superadmin,
      branchId: branch.id,
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@aceromax.mx',
      phone: '5550000002',
      role: Role.admin,
      branchId: branch.id,
    },
  })

  const customer1 = await prisma.user.create({
    data: {
      name: 'Customer One',
      email: 'customer1@example.com',
      phone: '5550000003',
      role: Role.customer,
      branchId: branch.id,
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: 'Customer Two',
      email: 'customer2@example.com',
      phone: '5550000004',
      role: Role.customer,
      branchId: branch.id,
    },
  })

  // Example purchase + points issuance for customer1
  const purchase = await prisma.purchase.create({
    data: {
      userId: customer1.id,
      branchId: branch.id,
      folio: 'FOLIO-0001',
      description: 'Steel bars',
      amount: 1234.56,
      receiptUrl: null,
      status: 'approved',
    },
  })

  const points = Math.floor(1234.56 / 100)
  const value = points * 0.5

  await prisma.pointsTransaction.create({
    data: {
      userId: customer1.id,
      branchId: branch.id,
      purchaseId: purchase.id,
      type: 'earn',
      points,
      value,
      status: 'confirmed',
    },
  })

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'seed_initial_data',
      details: {
        branchId: branch.id,
        users: [superadmin.id, admin.id, customer1.id, customer2.id],
      },
    },
  })

  console.log('Seed completed.')
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


