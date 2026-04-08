import { describe, it, expect } from "vitest";
import prisma from "../../config/prisma.js";
import stockBatchService from "../../modules/stock-batches/stock-batch.service.js";
import {
  deductStockFifo,
  restockFifo,
} from "../../modules/transactions/transaction.service.js";

describe("FIFO Stock Logic", () => {
  it("should deduct stock from batches in FIFO order (oldest first)", async () => {
    const product = await prisma.product.create({
      data: {
        sku: "FIFO-001",
        name: "FIFO Product",
        price: 10000,
      },
    });

    // Batch 1 (Older): 10 pcs
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 5000,
      },
    });

    // Batch 2 (Newer): 10 pcs
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 6000,
      },
    });

    // Deduct 15 pcs
    // FIFO means: 10 from Batch 1, 5 from Batch 2
    await prisma.$transaction(async (tx) => {
      await deductStockFifo(tx, product.id, 15);
    });

    const batches = await prisma.stockBatch.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "asc" },
    });

    expect(batches[0]!.remainingQuantity).toBe(0); // Batch 1 (Older)
    expect(batches[1]!.remainingQuantity).toBe(5); // Batch 2 (Newer)
  });

  it("should restock to the latest batch", async () => {
    const product = await prisma.product.create({
      data: {
        sku: "FIFO-002",
        name: "Restock Product",
        price: 10000,
      },
    });

    // Create a batch
    await stockBatchService.createStockBatch({
      data: {
        productId: product.id,
        initialQuantity: 10,
        purchasePrice: 5000,
      },
    });

    // Deduct 5 pcs
    await prisma.$transaction(async (tx) => {
      await deductStockFifo(tx, product.id, 5);
    });

    let batch = await prisma.stockBatch.findFirst({
      where: { productId: product.id },
    });
    expect(batch?.remainingQuantity).toBe(5);

    // Restock 5 pcs
    await prisma.$transaction(async (tx) => {
      await restockFifo(tx, product.id, 5);
    });

    batch = await prisma.stockBatch.findFirst({
      where: { productId: product.id },
    });
    expect(batch?.remainingQuantity).toBe(10);
  });
});
