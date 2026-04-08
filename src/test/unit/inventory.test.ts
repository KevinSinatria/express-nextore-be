import { describe, it, expect } from 'vitest';
import prisma from '../../config/prisma.js';
import stockBatchService from '../../modules/stock-batches/stock-batch.service.js';

describe('Inventory HPP & Loss Alert Logic', () => {
  it('should calculate moving average HPP correctly on new batch', async () => {
    // 1. Create a product
    const product = await prisma.product.create({
      data: {
        sku: 'TEST-001',
        name: 'Test Product',
        price: 10000,
        totalStock: 0,
        hppAverage: 0,
      },
    });

    // 2. Add first batch: 10 pcs @ 5000
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 5000,
      },
    });

    let updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.hppAverage).toBe(5000);
    expect(updatedProduct?.totalStock).toBe(10);

    // 3. Add second batch: 10 pcs @ 7000
    // Total Value = (10 * 5000) + (10 * 7000) = 50,000 + 70,000 = 120,000
    // Total Qty = 20
    // New HPP = 120,000 / 20 = 6000
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 7000,
      },
    });

    updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.hppAverage).toBe(6000);
    expect(updatedProduct?.totalStock).toBe(20);
  });

  it('should trigger hasLossAlert when price < hppAverage', async () => {
    const product = await prisma.product.create({
      data: {
        sku: 'LOSS-001',
        name: 'Loss Product',
        price: 4000, // Price is 4000
        totalStock: 0,
        hppAverage: 0,
      },
    });

    // Add batch with HPP 5000 (Loss Alert should trigger)
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 5000,
      },
    });

    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.hppAverage).toBe(5000);
    expect(updatedProduct?.hasLossAlert).toBe(true);
  });

  it('should sync bundle HPP when component HPP changes', async () => {
    // 1. Create component
    const component = await prisma.product.create({
      data: {
        sku: 'COMP-001',
        name: 'Component',
        price: 5000,
      },
    });

    // 2. Create bundle with 2x component
    const bundle = await prisma.product.create({
      data: {
        sku: 'BNDL-001',
        name: 'Dual Pack',
        price: 15000,
        isBundle: true,
        bundleComponents: {
          create: {
            componentId: component.id,
            qty: 2,
          },
        },
      },
    });

    // Initial Bundle HPP should be 0 because component HPP is 0
    let updatedBundle = await prisma.product.findUnique({ where: { id: bundle.id } });
    expect(updatedBundle?.hppAverage).toBe(0);

    // 3. Add batch to component: 10 pcs @ 4000
    // Bundle HPP should become 2 * 4000 = 8000
    await stockBatchService.createStockBatch({
      data: {
        productId: component.id,
        initialQuantity: 10,
        purchasePrice: 4000,
      },
    });

    updatedBundle = await prisma.product.findUnique({ where: { id: bundle.id } });
    expect(updatedBundle?.hppAverage).toBe(8000);
  });

  it('should revert HPP correctly when batch is deleted', async () => {
    const product = await prisma.product.create({
      data: {
        sku: 'DEL-001',
        name: 'Delete Test',
        price: 10000,
      },
    });

    // Batch 1: 10 @ 5000
    const b1 = await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 5000,
      },
    });

    // Batch 2: 10 @ 7000 (HPP becomes 6000)
    const b2 = await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 7000,
      },
    });

    // Delete Batch 2 -> HPP should go back to 5000
    await stockBatchService.deleteStockBatch({ id: b2.id });

    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updatedProduct?.hppAverage).toBe(5000);
    expect(updatedProduct?.totalStock).toBe(10);
  });
});
