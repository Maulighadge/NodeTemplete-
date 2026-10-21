import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting database seeding...');

  // Upsert initial admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      phone: '9876543210',
      role: Role.ADMIN,
    },
  });

  console.info(`👤 Seeded User: ${adminUser.email} (Role: ${adminUser.role})`);

  // Upsert sample example record
  const sampleExample = await prisma.example.upsert({
    where: { email: 'sample@example.com' },
    update: {},
    create: {
      name: 'Starter Example',
      email: 'sample@example.com',
      phone: '9876543211',
      role: Role.USER,
    },
  });

  console.info(`📦 Seeded Example: ${sampleExample.name}`);
  console.info('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
