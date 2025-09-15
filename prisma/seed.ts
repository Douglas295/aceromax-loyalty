import { PrismaClient } from '@prisma/client';
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
    },
  });

  // Create Superadmin
  const superadmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'superadmin',
      branchId: branch.id,
      businessType: "individual", 
    },
  });

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      branchId: branch.id,
      businessType: "individual", 
    },
  });

  // Create Clients
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Client One',
        email: 'client1@example.com',
        password: hashedPassword,
        role: 'customer',
        branchId: branch.id,
        businessType: "individual", 
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client Two',
        email: 'client2@example.com',
        password: hashedPassword,
        role: 'customer',
        branchId: branch.id,
        businessType: "individual", 
      },
    }),
    prisma.user.create({
      data: {
        name: 'Client Three',
        email: 'client3@example.com',
        password: hashedPassword,
        role: 'customer',
        branchId: branch.id,
        businessType: "individual", 
      },
    }),
  ]);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
