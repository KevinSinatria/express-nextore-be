import prisma from "../config/prisma.js";

/**
 * Generates a formatted batch number: BCH-YYYYMMDD-XXXX
 * Example: BCH-20260402-0001
 */
export const generateBatchNumber = async (): Promise<string> => {
  const now = new Date();

  const dateString = now.toISOString().slice(0, 10).replace(/-/g, "");

  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const batchCount = await prisma.stockBatch.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const nextNumber = (batchCount + 1).toString().padStart(4, "0");
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  return `BCH-${dateString}-${nextNumber}-${randomSuffix}`;
};
