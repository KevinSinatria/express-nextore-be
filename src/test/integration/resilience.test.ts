import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import prisma from '../../config/prisma.js';
import stockBatchService from '../../modules/stock-batches/stock-batch.service.js';
import { mockSession } from '../setup.js';

describe('System Resilience & Concurrency Audit', () => {
  beforeEach(async () => {
    mockSession.session.activeRole = 'ADMIN';
    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: {},
      create: {
        id: 'test-user-id',
        name: 'Resilience Tester',
        username: 'resilience_test',
        roles: ['ADMIN'],
      },
    });
  });

  describe('Concurrency Handling (Race Conditions)', () => {
    it('should only allow one success when multiple users buy the last stock', async () => {
      // 1. Setup: Product with 1 stock
      const product = await prisma.product.create({
        data: { sku: 'CONC-001', name: 'Limited Item', price: 10000 },
      });
      await stockBatchService.createStockBatch({
        data: { productId: product.id, initialQuantity: 1, purchasePrice: 5000 },
      });

      // 2. Perform 5 concurrent requests to buy that 1 item
      const requests = Array.from({ length: 5 }).map(() =>
        request(app)
          .post('/transactions')
          .send({
            paymentMethod: 'CASH',
            status: 'COMPLETED',
            items: [{ productId: product.id, qty: 1 }],
          })
      );

      const results = await Promise.all(requests);

      // 3. Verify exactly one succeeded (201) and others failed (400)
      const successes = results.filter((r) => r.status === 201);
      const failures = results.filter((r) => r.status === 400 || r.status === 409);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(4);

      // 4. Verify stock is exactly 0
      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(updatedProduct?.totalStock).toBe(0);
    });
  });

  describe('Transactional Integrity (Rollback)', () => {
    it('should rollback stock changes if a later item in the same transaction fails', async () => {
       const productA = await prisma.product.create({
          data: { sku: 'ROLL-A', name: 'Product A', price: 10000 }
       });
       await stockBatchService.createStockBatch({
          data: { productId: productA.id, initialQuantity: 10, purchasePrice: 5000 }
       });

       // Create a second product just to be sure
       const productB = await prisma.product.create({
          data: { sku: 'ROLL-B', name: 'Product B', price: 20000 }
       });

       // Trigger transaction with one valid product and one INVALID product ID
       // The first one will be processed (deducted), then the second will fail (404)
       const res = await request(app).post('/transactions').send({
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          items: [
            { productId: productA.id, qty: 5 },  // Valid, will be processed first
            { productId: 'NON_EXISTENT_ID', qty: 1 } // Invalid, causes failure
          ]
       });

       expect(res.status).toBe(404); // Product not found
       
       // CRITICAL AUDIT: Verify Product A's stock was NOT deducted (rolled back)
       const updatedProductA = await prisma.product.findUnique({ where: { id: productA.id } });
       expect(updatedProductA?.totalStock).toBe(10); // Should be 10, not 5!
    });
  });
});
