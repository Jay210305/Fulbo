import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import {
  PrismaClient,
  Role,
  ProductCategory,
  DiscountType,
  BookingStatus,
  PaymentStatus,
  FieldStatus,
} from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean in reverse dependency order
  await prisma.bookingProduct.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.review.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.fieldPhoto.deleteMany();
  await prisma.field.deleteMany();
  await prisma.paymentSettings.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  const player = await prisma.user.create({
    data: {
      email: 'player@fulbo.com',
      password,
      firstName: 'Juan',
      lastName: 'Pérez',
      phoneNumber: '+51987654321',
      phoneVerified: true,
      role: Role.player,
      city: 'Lima',
      district: 'Miraflores',
      position: 'Delantero',
      gameLevel: 4,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@fulbo.com',
      password,
      firstName: 'María',
      lastName: 'Gómez',
      phoneNumber: '+51912345678',
      phoneVerified: true,
      role: Role.manager,
      businessProfile: {
        create: {
          businessName: 'Canchas La Merced S.A.C.',
          ruc: '20123456789',
          address: 'Av. La Merced 123, Miraflores',
          phone: '+51912345678',
          email: 'manager@fulbo.com',
        },
      },
      paymentSettings: {
        create: {
          yapeEnabled: true,
          yapePhone: '+51912345678',
          plinEnabled: false,
          bankTransferEnabled: true,
          bankName: 'BCP',
          bankAccountNumber: '1931234567890',
          bankAccountHolder: 'María Gómez',
          bankCci: '00219312345678901234',
          cashEnabled: true,
        },
      },
    },
  });

  const field1 = await prisma.field.create({
    data: {
      ownerId: manager.id,
      name: 'Canchita La Merced',
      address: 'Av. La Merced 123, Miraflores',
      description: 'Cancha de grass sintético con iluminación LED',
      type: '7v7',
      surface: 'Sintético',
      capacity: 14,
      basePricePerHour: 80,
      weekendSurcharge: 20,
      nightSurcharge: 10,
      status: FieldStatus.active,
      amenities: { lighting: true, lockers: true, parking: true, wifi: false },
      hasFullVaso: true,
      photos: {
        create: [{ url: 'https://picsum.photos/seed/field1/800/400', isCover: true }],
      },
    },
  });

  const field2 = await prisma.field.create({
    data: {
      ownerId: manager.id,
      name: 'Estadio Zona Sur',
      address: 'Av. Sur 456, Surco',
      description: 'Cancha 11 con tribunas y vestuarios',
      type: '11v11',
      surface: 'Grass Natural',
      capacity: 22,
      basePricePerHour: 120,
      weekendSurcharge: 30,
      status: FieldStatus.active,
      amenities: { lighting: true, lockers: true, parking: true, wifi: true },
      hasFullVaso: true,
      photos: {
        create: [{ url: 'https://picsum.photos/seed/field2/800/400', isCover: true }],
      },
    },
  });

  await prisma.field.create({
    data: {
      ownerId: manager.id,
      name: 'Cancha Los Pinos',
      address: 'Jr. Pinos 789, San Isidro',
      description: 'Cancha 5 techada',
      type: '5v5',
      surface: 'Sintético',
      capacity: 10,
      basePricePerHour: 60,
      status: FieldStatus.active,
      amenities: { lighting: true, lockers: false, parking: false, wifi: false },
      hasFullVaso: false,
      photos: {
        create: [{ url: 'https://picsum.photos/seed/field3/800/400', isCover: true }],
      },
    },
  });

  // FulVaso products for field1
  await prisma.product.createMany({
    data: [
      { fieldId: field1.id, name: 'Gatorade', description: 'Bebida hidratante 500ml', price: 5, category: ProductCategory.bebida, isActive: true },
      { fieldId: field1.id, name: 'Agua Mineral', description: 'Botella 500ml', price: 3, category: ProductCategory.bebida, isActive: true },
      { fieldId: field1.id, name: 'Powerade', description: 'Bebida isotónica', price: 5, category: ProductCategory.bebida, isActive: true },
      { fieldId: field1.id, name: 'Snickers', description: 'Chocolate', price: 3, category: ProductCategory.snack, isActive: true },
      { fieldId: field1.id, name: 'Papas Lays', description: 'Bolsa grande', price: 4, category: ProductCategory.snack, isActive: true },
    ],
  });

  // Promotion for field1
  await prisma.promotion.create({
    data: {
      fieldId: field1.id,
      title: '20% de descuento entre semana',
      description: 'Lunes a viernes antes de las 3pm',
      discountType: DiscountType.percentage,
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // A confirmed booking
  const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  startTime.setHours(20, 0, 0, 0);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  await prisma.booking.create({
    data: {
      playerId: player.id,
      fieldId: field1.id,
      startTime,
      endTime,
      totalPrice: 80,
      status: BookingStatus.confirmed,
      paymentStatus: PaymentStatus.succeeded,
      paymentMethod: 'yape',
      matchName: 'Pichanga de los viernes',
    },
  });

  console.log('Seed complete');
  console.log('  Player : player@fulbo.com / password123');
  console.log('  Manager: manager@fulbo.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
