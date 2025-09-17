import { PrismaClient, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hashing password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'MainBranch',
      address: '123 Main St, Cityville',
      price: new Prisma.Decimal(0.5),  
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: 'Branch2',
      address: 'Branch 2 village',
      price: new Prisma.Decimal(0.6),  
    },
  });

  // Create Superadmin
  await prisma.user.create({
    data: {
      name: 'SuperAdmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: Role.superadmin,  
      branchId: branch.id,
      businessType: "business",
    },
  });

  // Create Admin
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.admin,
      branchId: branch.id,
      businessType: "individual",
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin2',
      email: 'admin2@example.com',
      password: hashedPassword,
      role: Role.admin,
      branchId: branch2.id,
      businessType: "individual",
    },
  });

  // Create Clients
  await Promise.all([
    prisma.user.create({
      data: {
        name: 'Client',
        email: 'client@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch.id,
        businessType: "individual",
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client2',
        email: 'client2@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch.id,
        businessType: "individual",
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client3',
        email: 'client3@example.com',
        password: hashedPassword,
        role: Role.customer,
        branchId: branch2.id,
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
