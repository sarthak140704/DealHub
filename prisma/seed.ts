import 'dotenv/config';
import { PrismaClient, Role, DealStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding DealHub database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@dealhub.com',
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      username: 'techstore',
      email: 'vendor1@dealhub.com',
      passwordHash: hash,
      role: Role.VENDOR,
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      username: 'fashionhub',
      email: 'vendor2@dealhub.com',
      passwordHash: hash,
      role: Role.VENDOR,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: hash,
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash: hash,
      role: Role.CUSTOMER,
    },
  });

  // --- Vendors ---
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendorUser1.id,
      companyName: 'TechStore Pro',
      rating: 4.5,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      companyName: 'Fashion Hub',
      rating: 4.2,
    },
  });

  // --- Categories ---
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', slug: 'electronics' } }),
    prisma.category.create({ data: { name: 'Fashion', slug: 'fashion' } }),
    prisma.category.create({ data: { name: 'Food & Dining', slug: 'food-dining' } }),
    prisma.category.create({ data: { name: 'Travel', slug: 'travel' } }),
    prisma.category.create({ data: { name: 'Home & Garden', slug: 'home-garden' } }),
    prisma.category.create({ data: { name: 'Health & Beauty', slug: 'health-beauty' } }),
  ]);

  const [electronics, fashion, food, travel, homeGarden, health] = categories;

  // --- Stores ---
  const store1 = await prisma.store.create({
    data: { name: 'Amazon', baseUrl: 'https://amazon.com', logoUrl: null },
  });

  const store2 = await prisma.store.create({
    data: { name: 'Flipkart', baseUrl: 'https://flipkart.com', logoUrl: null },
  });

  const store3 = await prisma.store.create({
    data: { name: 'Myntra', baseUrl: 'https://myntra.com', logoUrl: null },
  });

  // --- Deals ---
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: 'MacBook Air M3 — Flat ₹15,000 Off',
        description: 'Get the latest MacBook Air with M3 chip at an incredible discount. Includes free AppleCare+ for 1 year.',
        originalPrice: 114900,
        discountPrice: 99900,
        dealUrl: 'https://amazon.com/macbook-air-m3',
        expiryDate: new Date('2026-05-01'),
        status: DealStatus.ACTIVE,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        storeId: store1.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Sony WH-1000XM5 — 40% Off',
        description: 'Industry-leading noise cancelling headphones with exceptional sound quality.',
        originalPrice: 29990,
        discountPrice: 17990,
        dealUrl: 'https://amazon.com/sony-xm5',
        expiryDate: new Date('2026-04-20'),
        status: DealStatus.ACTIVE,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        storeId: store1.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'iPhone 16 Pro — Exchange Bonus ₹10,000',
        description: 'Upgrade to the iPhone 16 Pro with an extra exchange bonus on top of regular offers.',
        originalPrice: 134900,
        discountPrice: 119900,
        dealUrl: 'https://flipkart.com/iphone-16-pro',
        expiryDate: new Date('2026-04-15'),
        status: DealStatus.ACTIVE,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        storeId: store2.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Levi\'s 501 Jeans — Buy 2 Get 1 Free',
        description: 'Classic Levi\'s 501 Original Fit jeans. Mix and match eligible styles.',
        originalPrice: 4499,
        discountPrice: 2999,
        dealUrl: 'https://myntra.com/levis-501',
        expiryDate: new Date('2026-04-30'),
        status: DealStatus.ACTIVE,
        categoryId: fashion.id,
        vendorId: vendor2.id,
        storeId: store3.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Nike Air Max 90 — 35% Off',
        description: 'Timeless sneaker design with modern comfort. Available in all sizes.',
        originalPrice: 12995,
        discountPrice: 8447,
        dealUrl: 'https://myntra.com/nike-airmax90',
        expiryDate: new Date('2026-05-10'),
        status: DealStatus.ACTIVE,
        categoryId: fashion.id,
        vendorId: vendor2.id,
        storeId: store3.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Zomato Gold — 60% Off Annual Plan',
        description: 'Unlimited free deliveries and up to 30% extra discount on food orders for a year.',
        originalPrice: 1200,
        discountPrice: 480,
        dealUrl: 'https://zomato.com/gold',
        expiryDate: new Date('2026-04-25'),
        status: DealStatus.ACTIVE,
        categoryId: food.id,
        vendorId: vendor1.id,
        storeId: store1.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'MakeMyTrip — ₹5,000 Off on International Flights',
        description: 'Use code INTFLY to get flat ₹5,000 off on international flight bookings.',
        originalPrice: 35000,
        discountPrice: 30000,
        dealUrl: 'https://makemytrip.com',
        expiryDate: new Date('2026-06-01'),
        status: DealStatus.ACTIVE,
        categoryId: travel.id,
        vendorId: vendor1.id,
        storeId: store1.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'IKEA Furniture Sale — Up to 50% Off',
        description: 'Massive clearance on sofas, tables, and storage solutions. Limited stock.',
        originalPrice: 25000,
        discountPrice: 12500,
        dealUrl: 'https://ikea.com/sale',
        expiryDate: new Date('2026-05-15'),
        status: DealStatus.ACTIVE,
        categoryId: homeGarden.id,
        vendorId: vendor2.id,
        storeId: store2.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Nykaa Beauty Box — Flat 40% Off',
        description: 'Curated beauty box with premium skincare and makeup products worth ₹5,000+.',
        originalPrice: 3500,
        discountPrice: 2100,
        dealUrl: 'https://nykaa.com/beauty-box',
        expiryDate: new Date('2026-04-28'),
        status: DealStatus.ACTIVE,
        categoryId: health.id,
        vendorId: vendor2.id,
        storeId: store3.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Samsung Galaxy S25 Ultra — Pre-order Bonus',
        description: 'Pre-order and get free Galaxy Buds3 Pro + ₹8,000 upgrade bonus.',
        originalPrice: 134999,
        discountPrice: 124999,
        dealUrl: 'https://flipkart.com/galaxy-s25-ultra',
        expiryDate: new Date('2026-04-10'),
        status: DealStatus.PENDING_APPROVAL,
        categoryId: electronics.id,
        vendorId: vendor1.id,
        storeId: store2.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Adidas Ultraboost — Flat 25% Off',
        description: 'Premium running shoes with Boost cushioning technology.',
        originalPrice: 16999,
        discountPrice: 12749,
        dealUrl: 'https://myntra.com/adidas-ultraboost',
        expiryDate: new Date('2026-05-20'),
        status: DealStatus.PENDING_APPROVAL,
        categoryId: fashion.id,
        vendorId: vendor2.id,
        storeId: store3.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: 'Dyson V15 Vacuum — ₹12,000 Off',
        description: 'Most powerful cordless vacuum with laser dust detection.',
        originalPrice: 62900,
        discountPrice: 50900,
        dealUrl: 'https://amazon.com/dyson-v15',
        expiryDate: new Date('2026-03-01'),
        status: DealStatus.EXPIRED,
        categoryId: homeGarden.id,
        vendorId: vendor1.id,
        storeId: store1.id,
      },
    }),
  ]);

  // --- Bookmarks ---
  await prisma.bookmark.createMany({
    data: [
      { userId: customer1.id, dealId: deals[0].id },
      { userId: customer1.id, dealId: deals[1].id },
      { userId: customer1.id, dealId: deals[5].id },
      { userId: customer2.id, dealId: deals[3].id },
      { userId: customer2.id, dealId: deals[7].id },
    ],
  });

  // --- Reviews ---
  await prisma.review.createMany({
    data: [
      { userId: customer1.id, dealId: deals[0].id, rating: 5, comment: 'Incredible deal! Got my MacBook at the best price.' },
      { userId: customer1.id, dealId: deals[1].id, rating: 4, comment: 'Great headphones, fast delivery.' },
      { userId: customer2.id, dealId: deals[3].id, rating: 5, comment: 'Amazing value — love the buy 2 get 1 offer!' },
      { userId: customer2.id, dealId: deals[7].id, rating: 3, comment: 'Good prices but limited stock.' },
    ],
  });

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      { userId: customer1.id, message: 'Your bookmarked deal "MacBook Air M3" expires in 3 days!', type: 'DEAL_EXPIRING', isRead: false },
      { userId: customer1.id, message: 'New deals in Electronics category!', type: 'NEW_DEALS', isRead: true },
      { userId: customer2.id, message: 'Welcome to DealHub! Start browsing deals now.', type: 'WELCOME', isRead: false },
      { userId: vendorUser1.id, message: 'Your deal "Samsung Galaxy S25 Ultra" is pending approval.', type: 'DEAL_STATUS', isRead: false },
      { userId: vendorUser2.id, message: 'Your deal "Nike Air Max 90" has been approved!', type: 'DEAL_STATUS', isRead: true },
      { userId: admin.id, message: '2 new deals are pending approval.', type: 'ADMIN_ALERT', isRead: false },
    ],
  });

  // --- Audit Logs ---
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, actionType: 'USER_CREATED' },
      { userId: admin.id, actionType: 'DEAL_APPROVED' },
      { userId: vendorUser1.id, actionType: 'DEAL_SUBMITTED' },
      { userId: vendorUser2.id, actionType: 'DEAL_SUBMITTED' },
      { userId: customer1.id, actionType: 'DEAL_BOOKMARKED' },
      { userId: customer1.id, actionType: 'REVIEW_POSTED' },
    ],
  });

  console.log('✅ Seed complete!');
  console.log(`   Users: 5 (1 admin, 2 vendors, 2 customers)`);
  console.log(`   Categories: 6`);
  console.log(`   Stores: 3`);
  console.log(`   Deals: 12`);
  console.log(`   Bookmarks: 5`);
  console.log(`   Reviews: 4`);
  console.log(`   Notifications: 6`);
  console.log(`   Audit Logs: 6`);
  console.log('');
  console.log('   Login credentials (all passwords: password123):');
  console.log('   Admin:    admin@dealhub.com');
  console.log('   Vendor 1: vendor1@dealhub.com');
  console.log('   Vendor 2: vendor2@dealhub.com');
  console.log('   Customer: john@example.com');
  console.log('   Customer: jane@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
