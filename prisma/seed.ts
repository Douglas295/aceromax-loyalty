import { PrismaClient, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hashing password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      address: '123 Main St, Cityville',
      price: new Prisma.Decimal(0.5), // ✅ Fix: must be Decimal
    },
  });

  // Create Superadmin
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: Role.superadmin, // ✅ use enum, not string
      branchId: branch.id,
      businessType: "individual",
    },
  });

  // Create Admin
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.admin,
      branchId: branch.id,
      businessType: "individual",
    },
  });

  // Create Clients
  await Promise.all([
    prisma.user.create({
      data: {
        name: 'Client One',
        email: 'client1@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch.id,
        businessType: "individual",
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client Two',
        email: 'client2@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch.id,
        businessType: "individual",
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client Three',
        email: 'client3@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch.id,
        businessType: "individual",
      },
    }),
  ]);

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
