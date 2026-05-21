import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type z from "zod";
import type stockBatchSchema from "./stock-batch.schema.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";
import { generateBatchNumber } from "../../utils/generateBatchNumber.js";
import { checkLossAlert, syncBundleHpp } from "../../utils/inventoryLogic.js";
import notificationService from "../notifications/notification.service.js";

type CreateStockBatchParams = z.infer<
  typeof stockBatchSchema.createStockBatchSchema
>;
type UpdateStockBatchParams = z.infer<
  typeof stockBatchSchema.updateStockBatchSchema
>;
type GetAllStockBatchesParams = z.infer<
  typeof stockBatchSchema.getAllStockBatchesSchema
>;
type DeleteStockBatchParams = z.infer<
  typeof stockBatchSchema.deleteStockBatchSchema
>;

const stockBatchService = {
  getAllStockBatches: async ({
    query,
  }: {
    query: GetAllStockBatchesParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search, productId } = query;

    const where: Prisma.StockBatchWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (search) {
      where.OR = [
        {
          batchNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          product: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [batches, count] = await Promise.all([
      prisma.stockBatch.findMany({
        where,
        skip,
        take: limit || 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
      prisma.stockBatch.count({
        where,
      }),
    ]);

    const meta = createPaginationMeta(count, page, limit);
    return { data: batches, meta };
  },

  getStockBatchById: async ({ id }: { id: string }) => {
    const batch = await prisma.stockBatch.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!batch) {
      throw new CustomError(404, `Batch stok dengan ID ${id} tidak ditemukan.`);
    }

    return batch;
  },

  getStockBatchesByProductId: async ({ productId }: { productId: string }) => {
    const batches = await prisma.stockBatch.findMany({
      where: {
        productId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (batches.length === 0) {
      throw new CustomError(
        404,
        `Batch stok untuk produk dengan ID ${productId} tidak ditemukan.`,
      );
    }

    return batches;
  },

  createStockBatch: async ({
    data,
  }: {
    data: CreateStockBatchParams["body"];
  }) => {
    const { productId, initialQuantity, purchasePrice, expiryDate } = data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw new CustomError(404, `Produk dengan ID ${productId} tidak ditemukan.`);
    }

    if (product.category?.hasExpiry && !expiryDate) {
      throw new CustomError(
        400,
        `Product category "${product.category.name}" requires an expiry date.`,
      );
    }

    const batchNumber = await generateBatchNumber();

    const result = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.stockBatch.create({
        data: {
          productId,
          batchNumber,
          initialQuantity: Number(initialQuantity),
          remainingQuantity: Number(initialQuantity),
          purchasePrice,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
      });

      const currentValue = product.totalStock * product.hppAverage;
      const newValue = currentValue + initialQuantity * purchasePrice;
      const newTotalStock = product.totalStock + Number(initialQuantity);
      const newHppAverage = newTotalStock > 0 ? newValue / newTotalStock : 0;

      await tx.product.update({
        where: { id: productId },
        data: {
          totalStock: { increment: Number(initialQuantity) },
          hppAverage: newHppAverage,
        },
      });

      await checkLossAlert(tx, productId);
      await syncBundleHpp(tx, productId);

      return newBatch;
    });

    if (expiryDate) {
      notificationService.triggerRealtimeNotification();
    }

    return result;
  },

  updateStockBatch: async ({
    id,
    data,
  }: {
    id: UpdateStockBatchParams["params"]["id"];
    data: UpdateStockBatchParams["body"];
  }) => {
    const { purchasePrice, expiryDate } = data;

    const existingBatch = await prisma.stockBatch.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingBatch) {
      throw new CustomError(404, `Batch stok dengan ID ${id} tidak ditemukan.`);
    }

    const hasSale =
      existingBatch.remainingQuantity < existingBatch.initialQuantity;

    return await prisma.$transaction(async (tx) => {
      if (
        purchasePrice !== undefined &&
        purchasePrice !== existingBatch.purchasePrice
      ) {
        if (hasSale) {
          throw new CustomError(
            400,
            "Tidak dapat memperbarui harga beli dari batch stok yang sudah terjual sebagian.",
          );
        }

        const product = existingBatch.product;
        const currentValue = product.totalStock * product.hppAverage;
        const newValue =
          currentValue -
          existingBatch.initialQuantity * existingBatch.purchasePrice +
          existingBatch.initialQuantity * purchasePrice;

        const newHppAverage =
          product.totalStock > 0 ? newValue / product.totalStock : 0;

        await tx.product.update({
          where: { id: product.id },
          data: { hppAverage: newHppAverage },
        });

        await checkLossAlert(tx, product.id);
        await syncBundleHpp(tx, product.id);
      }

      if (expiryDate !== undefined) {
        if (hasSale) {
          throw new CustomError(
            400,
            "Tidak dapat memperbarui data dari batch stok yang sudah terjual sebagian.",
          );
        }
      }

      const updatedBatch = await tx.stockBatch.update({
        where: { id },
        data: {
          ...(purchasePrice !== undefined && { purchasePrice }),
          ...(expiryDate !== undefined && {
            expiryDate: expiryDate ? new Date(expiryDate) : null,
          }),
        },
        include: {
          product: true,
        },
      });

      return updatedBatch;
    });
  },

  deleteStockBatch: async ({
    id,
  }: {
    id: DeleteStockBatchParams["params"]["id"];
  }) => {
    const existingBatch = await prisma.stockBatch.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!existingBatch) {
      throw new CustomError(404, `Batch stok dengan ID ${id} tidak ditemukan.`);
    }

    if (existingBatch.remainingQuantity < existingBatch.initialQuantity) {
      throw new CustomError(
        400,
        "Tidak dapat menghapus batch stok yang sudah terjual sebagian.",
      );
    }

    return await prisma.$transaction(async (tx) => {
      const product = existingBatch.product;
      const newTotalStock = product.totalStock - existingBatch.initialQuantity;

      let newHppAverage = 0;
      if (newTotalStock > 0) {
        const currentValue = product.totalStock * product.hppAverage;
        const newValue =
          currentValue -
          existingBatch.initialQuantity * existingBatch.purchasePrice;
        newHppAverage = newValue / newTotalStock;
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          totalStock: { decrement: existingBatch.initialQuantity },
          hppAverage: newHppAverage,
        },
      });

      await checkLossAlert(tx, product.id);
      await syncBundleHpp(tx, product.id);

      return await tx.stockBatch.delete({
        where: { id },
      });
    });
  },
};

export default stockBatchService;
