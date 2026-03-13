import { faker } from "@faker-js/faker";
import { Role, TransactionStatus } from "../src/generated/prisma/client.js";
import prisma from "../src/config/prisma.js";
import { auth } from "../src/lib/auth.js";
async function main() {
    console.log("Starting to seed data... This might take a while.");
    // Clear existing data (order matters due to foreign keys)
    console.log("Clearing existing database...");
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.member.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    // 1. Seed Users
    console.log("Seeding Users...");
    const users = [];
    // Admin
    const admin = await auth.api.signUpEmail({
        body: {
            username: "admin",
            password: "admin123",
            name: "admin",
            role: "ADMIN",
            email: `admin@placeholder.local`,
        },
    });
    users.push(admin.user);
    // Supervisor
    const supervisor = await auth.api.signUpEmail({
        body: {
            username: "supervisor",
            password: "supervisor123",
            name: "supervisor",
            role: "SUPERVISOR",
            email: `supervisor@placeholder.local`,
        },
    });
    users.push(supervisor.user);
    // Cashiers
    for (let i = 0; i < 5; i++) {
        const cashier = await auth.api.signUpEmail({
            body: {
                username: `cashier${i}`,
                password: `cashier123`,
                name: `cashier${i}`,
                role: "CASHIER",
                email: `cashier${i}@placeholder.local`,
            },
        });
        users.push(cashier.user);
    }
    // 2. Seed Categories
    console.log("Seeding Categories...");
    const categories = [];
    for (let i = 0; i < 15; i++) {
        const category = await prisma.category.create({
            data: {
                name: faker.commerce.department(),
            },
        });
        categories.push(category);
    }
    // 3. Seed Products
    console.log("Seeding Products...");
    const products = [];
    for (let i = 0; i < 150; i++) {
        const hpp = parseFloat(faker.commerce.price({ min: 5000, max: 200000 }));
        // Margin between 10% and 50%
        const margin = faker.number.float({ min: 1.1, max: 1.5 });
        const price = Math.round(hpp * margin);
        const product = await prisma.product.create({
            data: {
                sku: faker.string.alphanumeric({ length: 10, casing: "upper" }),
                name: faker.commerce.productName(),
                images: [faker.image.url({ width: 400, height: 400 })],
                hpp: Math.round(hpp),
                price,
                stock: faker.number.int({ min: 10, max: 500 }),
                lowStockThreshold: faker.number.int({ min: 5, max: 30 }),
                categoryId: faker.helpers.arrayElement(categories).id,
            },
        });
        products.push(product);
    }
    // 4. Seed Members
    console.log("Seeding Members...");
    const members = [];
    for (let i = 0; i < 100; i++) {
        const member = await prisma.member.create({
            data: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                points: faker.number.int({ min: 0, max: 5000 }),
            },
        });
        members.push(member);
    }
    // 5. Seed Transactions (and TransactionItems)
    console.log("Seeding Transactions and Items...");
    for (let i = 0; i < 500; i++) {
        const numItems = faker.number.int({ min: 1, max: 8 });
        const selectedProducts = faker.helpers.arrayElements(products, numItems);
        let totalGross = 0;
        let totalHpp = 0;
        const itemsData = selectedProducts.map((product) => {
            const qty = faker.number.int({ min: 1, max: 5 });
            const priceAtSale = product.price;
            const hppAtSale = product.hpp;
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
        const possibleDiscounts = [0, 0, 0, 5000, 10000, 15000, 20000];
        let totalDiscount = faker.helpers.arrayElement(possibleDiscounts);
        // discount can't be more than gross
        if (totalDiscount >= totalGross) {
            totalDiscount = 0;
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
                status,
                userId: faker.helpers.arrayElement(users).id,
                memberId,
                createdAt,
                items: {
                    create: itemsData,
                },
            },
        });
        // Logging progress every 100 records to show something is happening
        if ((i + 1) % 100 === 0) {
            console.log(`  -> created ${i + 1} / 500 transactions...`);
        }
    }
    console.log("Data seeding completed successfully!");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map