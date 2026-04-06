import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import stockBatchService from '../../modules/stock-batches/stock-batch.service.js';

describe('Transaction Flow Integration (LIFO & Logic)', () => {
  beforeEach(async () => {
    // Ensure we have an admin user that matches our mock session
    // Needs to be in beforeEach because setup.ts truncates tables!
    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: {},
      create: {
        id: 'test-user-id',
        name: 'Test Administrator',
        username: 'admin_test',
        roles: ['ADMIN'],
      },
    });
  });

  it('should process a PENDING transaction and lock stock using LIFO', async () => {
    // 1. Setup Inventory
    const product = await prisma.product.create({
      data: {
        sku: 'FLOW-001',
        name: 'Flow Product',
        price: 10000,
      },
    });

    // Batch A (Older): 10 pcs @ 5000
    await stockBatchService.createStockBatch({
      data: { productId: product.id, initialQuantity: 10, purchasePrice: 5000 },
    });
    // Batch B (Newer): 10 pcs @ 6000
    await stockBatchService.createStockBatch({
      data: { productId: product.id, initialQuantity: 10, purchasePrice: 6000 },
    });

    // 2. Transaksi PENDING: Beli 15 pcs
    const res = await request(app)
      .post('/transactions')
      .send({
        paymentMethod: 'CASH',
        status: 'PENDING',
        customerName: 'Kevin',
        items: [{ productId: product.id, qty: 15 }],
      });

    expect(res.status).toBe(201);
    const transaction = res.body.data;
    
    // 3. Verify Stock Lock & LIFO
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.totalStock).toBe(5); // 20 - 15 = 5

    const batches = await prisma.stockBatch.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(batches[0]?.remainingQuantity).toBe(5); // Old batch left with 5
    expect(batches[1]?.remainingQuantity).toBe(0); // New batch exhausted

    // 4. Verify HPP Snapshot
    const item = await prisma.transactionItem.findFirst({
        where: { transactionId: transaction.id }
    });
    expect(item?.hppAtSale).toBe(5500); // 5500 average HPP at sale
  });

  it('should handle "Customer Plin-plan" scenario (Update Pending)', async () => {
    const product = await prisma.product.create({
      data: { sku: 'FLOW-002', name: 'PlinPlan Product', price: 10000 },
    });
    await stockBatchService.createStockBatch({
      data: { productId: product.id, initialQuantity: 20, purchasePrice: 5000 },
    });

    // Initial Order: 10 pcs (Pending)
    const createRes = await request(app)
      .post('/transactions')
      .send({
        paymentMethod: 'CASH',
        status: 'PENDING',
        customerName: 'PlinPlan',
        items: [{ productId: product.id, qty: 10 }],
      });
    
    const transactionId = createRes.body.data.id;
    let currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(currentProduct?.totalStock).toBe(10);

    // Update Order: Change qty from 10 to 5 (Restocking 5)
    const updateRes = await request(app)
      .patch(`/transactions/${transactionId}/update-pending`)
      .send({
        items: [{ productId: product.id, qty: 5 }]
      });

    expect(updateRes.status).toBe(200);
    currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(currentProduct?.totalStock).toBe(15); // 20 - 5 = 15
    
    const batch = await prisma.stockBatch.findFirst({ where: { productId: product.id } });
    expect(batch?.remainingQuantity).toBe(15);
  });

  it('should restore stock correctly on CANCEL (Delete Transaction)', async () => {
    const product = await prisma.product.create({
      data: { sku: 'FLOW-003', name: 'Cancel Product', price: 10000 },
    });
    await stockBatchService.createStockBatch({
      data: { productId: product.id, initialQuantity: 10, purchasePrice: 5000 },
    });

    // Create Order
    const createRes = await request(app).post('/transactions').send({
      paymentMethod: 'CASH',
      status: 'PENDING',
      customerName: 'CancelUser',
      items: [{ productId: product.id, qty: 5 }],
    });

    let currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(currentProduct?.totalStock).toBe(5);

    // Cancel
    const cancelRes = await request(app).delete(`/transactions/${createRes.body.data.id}`);
    expect(cancelRes.status).toBe(200);

    currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(currentProduct?.totalStock).toBe(10); // Restored
  });

  it('should explode bundles and deduct component stocks', async () => {
    const component = await prisma.product.create({
      data: { sku: 'FLOW-COMP', name: 'Raw Material', price: 5000 },
    });
    await stockBatchService.createStockBatch({
      data: { productId: component.id, initialQuantity: 20, purchasePrice: 2000 },
    });

    const bundle = await prisma.product.create({
      data: {
        sku: 'FLOW-BNDL',
        name: 'Mega Bundle',
        price: 20000,
        isBundle: true,
        bundleComponents: {
          create: { componentId: component.id, qty: 2 },
        },
      },
    });

    // Order 5 bundles (should consume 10 components)
    const res = await request(app).post('/transactions').send({
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      items: [{ productId: bundle.id, qty: 5 }],
    });

    expect(res.status).toBe(201);
    const updatedComp = await prisma.product.findUnique({ where: { id: component.id } });
    expect(updatedComp?.totalStock).toBe(10); // 20 - (5 * 2) = 10
  });

  it('should block non-existent products and members', async () => {
    const res = await request(app).post('/transactions').send({
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      items: [{ productId: 'invalid-id', qty: 1 }],
    });
    expect(res.status).toBe(404);
  });
});
