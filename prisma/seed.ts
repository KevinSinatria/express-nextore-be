import { faker } from "@faker-js/faker";
import { Role, TransactionStatus } from "../src/generated/prisma/client.js";
import prisma from "../src/config/prisma.js";
import { auth } from "../src/lib/auth.js";

async function main() {
  console.log("Starting to seed data... This might take a while.");

  // Clear existing data (order matters due to foreign keys)
  console.log("Clearing existing database...");
  await prisma.auditLog.deleteMany();
  await prisma.bundleComponent.deleteMany();
  await prisma.stockBatch.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.cashShift.deleteMany();
  await prisma.pos.deleteMany();
  await prisma.member.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log("Seeding Users...");
  const users = [];

  // Superuser (All roles)
  console.log("Creating Superuser...");
  const superuser = await auth.api.signUpEmail({
    body: {
      username: "superuser",
      password: "superuser123",
      name: "Superuser",
      email: `superuser@placeholder.local`,
    },
  });
  await prisma.user.update({
    where: { id: superuser.user.id },
    data: { roles: ["SUPERUSER", "ADMIN", "SUPERVISOR", "CASHIER"] },
  });
  users.push(superuser.user);

  // QA Tester (All roles)
  console.log("Creating QA Tester...");
  const qaTester = await auth.api.signUpEmail({
    body: {
      username: "qa_tester",
      password: "password123",
      name: "QA Tester",
      email: `qa_tester@placeholder.local`,
    },
  });
  await prisma.user.update({
    where: { id: qaTester.user.id },
    data: { roles: ["SUPERUSER", "ADMIN", "SUPERVISOR", "CASHIER"] },
  });
  users.push(qaTester.user);

  // Admin
  console.log("Creating Admin...");
  const admin = await auth.api.signUpEmail({
    body: {
      username: "admin",
      password: "admin123",
      name: "Admin",
      email: `admin@placeholder.local`,
    },
  });
  await prisma.user.update({
    where: { id: admin.user.id },
    data: { roles: ["ADMIN", "CASHIER"] },
  });
  users.push(admin.user);

  // Supervisor
  console.log("Creating Supervisor...");
  const supervisor = await auth.api.signUpEmail({
    body: {
      username: "supervisor",
      password: "supervisor123",
      name: "Supervisor",
      email: `supervisor@placeholder.local`,
    },
  });
  await prisma.user.update({
    where: { id: supervisor.user.id },
    data: { roles: ["SUPERVISOR", "CASHIER"] },
  });
  users.push(supervisor.user);

  // Cashiers
  console.log("Creating Cashiers...");
  for (let i = 0; i < 5; i++) {
    const cashier = await auth.api.signUpEmail({
      body: {
        username: `cashier${i}`,
        password: `cashier123`,
        name: `Cashier ${i}`,
        email: `cashier${i}@placeholder.local`,
      },
    });
    await prisma.user.update({
      where: { id: cashier.user.id },
      data: { roles: ["CASHIER"] },
    });
    users.push(cashier.user);
  }

  // 2. Seed POS Terminals
  console.log("Seeding POS Terminals...");
  const posTerminals = [];
  for (let i = 1; i <= 3; i++) {
    const pos = await prisma.pos.create({
      data: {
        name: `Cashier Register ${i}`,
        location: `Main Branch - F${i}`,
        deviceName: `POS-MCH-${i}`,
      },
    });
    posTerminals.push(pos);
  }

  // 3. Seed CashShifts for Cashiers
  console.log("Seeding Cash Shifts...");
  const shifts = [];
  for (const cashier of users.filter((u) => u.roles?.includes("CASHIER"))) {
    const shift = await prisma.cashShift.create({
      data: {
        userId: cashier.id,
        startingCash: 500000,
        expectedCash: 0,
        status: "OPEN",
      },
    });
    shifts.push(shift);
  }

  // 4. Seed Categories
  console.log("Seeding Categories...");
  const categories = [];
  for (let i = 0; i < 15; i++) {
    const category = await prisma.category.create({
      data: {
        name: faker.commerce.department(),
        hasExpiry: faker.datatype.boolean({ probability: 0.3 }),
      },
    });
    categories.push(category);
  }

  // 5. Seed Products, Bundles, and StockBatches
  console.log("Seeding Products and StockBatches...");
  const products = [];
  for (let i = 0; i < 50; i++) {
    const isBundle = i >= 40; // Last 10 are bundles
    const hpp = parseFloat(faker.commerce.price({ min: 5000, max: 150000 }));
    const price = Math.round(hpp * 1.3);
    const category = faker.helpers.arrayElement(categories);

    const product = await prisma.product.create({
      data: {
        sku: faker.string.alphanumeric({ length: 10, casing: "upper" }),
        name: isBundle
          ? `Paket ${faker.commerce.productName()}`
          : faker.commerce.productName(),
        images: [faker.image.url({ width: 400, height: 400 })],
        hppAverage: isBundle ? 0 : Math.round(hpp),
        price,
        totalStock: isBundle ? 0 : faker.number.int({ min: 50, max: 200 }),
        lowStockThreshold: 10,
        isBundle,
        categoryId: category.id,
      },
    });
    products.push(product);

    if (!isBundle) {
      let expiryDate = category.hasExpiry ? faker.date.future() : null;
      await prisma.stockBatch.create({
        data: {
          productId: product.id,
          batchNumber: `BATCH-${Date.now()}-${i}`,
          initialQuantity: product.totalStock,
          remainingQuantity: product.totalStock,
          purchasePrice: product.hppAverage,
          expiryDate,
        },
      });
    }
  }

  // Set Bundle Components
  console.log("Setting Bundle Components...");
  const bundles = products.filter((p) => p.isBundle);
  const regularProducts = products.filter((p) => !p.isBundle);
  for (const bundle of bundles) {
    const componentCount = faker.number.int({ min: 2, max: 4 });
    const selectedComponents = faker.helpers.arrayElements(
      regularProducts,
      componentCount,
    );

    let bundleHpp = 0;
    for (const comp of selectedComponents) {
      const qty = faker.number.int({ min: 1, max: 3 });
      await prisma.bundleComponent.create({
        data: {
          bundleProductId: bundle.id,
          componentId: comp.id,
          qty,
        },
      });
      bundleHpp += comp.hppAverage * qty;
    }

    await prisma.product.update({
      where: { id: bundle.id },
      data: { hppAverage: bundleHpp },
    });
  }

  // 6. Seed Discounts
  console.log("Seeding Discounts...");
  const discount = await prisma.discount.create({
    data: {
      name: "Promo Weekend Berkah",
      description: "Diskon akhir pekan untuk pelanggan setia",
      type: "PERCENTAGE",
      value: 10,
      startDate: faker.date.recent(),
      endDate: faker.date.future(),
      isActive: true,
      isTransactionLevel: true,
    },
  });

  // 7. Seed Members
  console.log("Seeding Members...");
  const members = [];
  for (let i = 0; i < 50; i++) {
    const member = await prisma.member.create({
      data: {
        name: faker.person.fullName(),
        phone: faker.phone.number(),
      },
    });
    members.push(member);
  }

  // 8. Seed Transactions (and TransactionItems)
  console.log("Seeding Transactions and Items...");
  for (let i = 0; i < 200; i++) {
    const numItems = faker.number.int({ min: 1, max: 8 });
    const selectedProducts = faker.helpers.arrayElements(products, numItems);

    let totalGross = 0;
    let totalHpp = 0;

    const itemsData = selectedProducts.map((product: any) => {
      const qty = faker.number.int({ min: 1, max: 5 });
      const priceAtSale = product.price;
      const hppAtSale = product.hppAverage;
      const subtotal = qty * priceAtSale;

      totalGross += subtotal;
      totalHpp += qty * hppAtSale;

      return {
        productId: product.id,
        qty,
        priceAtSale,
        hppAtSale,
        subtotal,
      };
    });

    const isDiscounted = faker.datatype.boolean({ probability: 0.3 });
    let totalDiscount = 0;

    if (isDiscounted) {
      totalDiscount = (totalGross * discount.value) / 100;
    }

    const totalNet = totalGross - totalDiscount;
    const totalProfit = totalNet - totalHpp;

    // Distribute randomly over the last 6 months
    const createdAt = faker.date.recent({ days: 180 });

    const isMember = faker.datatype.boolean({ probability: 0.6 });
    const memberId = isMember ? faker.helpers.arrayElement(members).id : null;

    // Some transactions are pending/cancelled, mostly completed
    const status = faker.helpers.weightedArrayElement([
      { weight: 85, value: TransactionStatus.COMPLETED },
      { weight: 10, value: TransactionStatus.PENDING },
      { weight: 5, value: TransactionStatus.CANCELLED },
    ]);

    await prisma.transaction.create({
      data: {
        invoiceNumber: `INV-${createdAt.getTime()}-${i}`,
        totalGross,
        totalDiscount,
        totalNet,
        totalProfit,
        paymentMethod: faker.helpers.arrayElement([
          "CASH",
          "QRIS",
          "DEBIT",
          "CREDIT_CARD",
        ]),
        cashReceived: status === "COMPLETED" ? totalNet : null,
        change: status === "COMPLETED" ? 0 : null,
        status,
        userId: faker.helpers.arrayElement(users).id,
        posId: faker.helpers.arrayElement(posTerminals).id,
        memberId,
        createdAt,
        items: {
          create: itemsData,
        },
      },
    });

    if ((i + 1) % 50 === 0) {
      console.log(`  -> created ${i + 1} / 200 transactions...`);
    }
  }

  console.log("Data seeding completed successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
