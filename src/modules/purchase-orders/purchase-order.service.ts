import { Prisma, PurchaseStatus } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import type z from "zod";
import type purchaseOrderSchema from "./purchase-order.schema.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";
import { generateBatchNumber } from "../../utils/generateBatchNumber.js";
import { checkLossAlert, syncBundleHpp } from "../../utils/inventoryLogic.js";

type CreatePurchaseOrderParams = z.infer<
  typeof purchaseOrderSchema.createPurchaseOrderSchema
>;
type UpdatePurchaseOrderParams = z.infer<
  typeof purchaseOrderSchema.updatePurchaseOrderSchema
>;
type GetAllPurchaseOrdersParams = z.infer<
  typeof purchaseOrderSchema.getAllPurchaseOrdersSchema
>;

const purchaseOrderService = {
  create: async ({
    data,
    userId,
  }: {
    data: CreatePurchaseOrderParams["body"];
    userId: string;
  }) => {
    const { productId, qty, purchasePrice, expiryDate, notes } = data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      throw new CustomError(404, `Product with ID ${productId} not found.`);
    }

    if (product.category?.hasExpiry && !expiryDate) {
      throw new CustomError(
        400,
        `Product category "${product.category.name}" requires an expiry date.`,
      );
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        productId: productId,
        qty: Number(qty),
        purchasePrice: Number(purchasePrice),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes: notes ?? null,
        createdById: userId,
        status: "PENDING",
      },
    });

    return purchaseOrder;
  },

  getAll: async ({ query }: { query: GetAllPurchaseOrdersParams["query"] }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });

    const { status, search } = query;

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (status) {
      where.status = status as PurchaseStatus;
    }

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          invoiceNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [purchaseOrders, count] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit ?? 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    const meta = createPaginationMeta(count, page, limit);
    return { data: purchaseOrders, meta };
  },

  getById: async ({ id }: { id: string }) => {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        product: true,
        createdBy: {
          select: { id: true, name: true, username: true },
        },
        approvedBy: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    if (!purchaseOrder) {
      throw new CustomError(404, `Purchase Order with ID ${id} not found.`);
    }

    return purchaseOrder;
  },

  getPending: async () => {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return purchaseOrders;
  },

  update: async ({
    id,
    data,
  }: {
    id: UpdatePurchaseOrderParams["params"]["id"];
    data: UpdatePurchaseOrderParams["body"];
  }) => {
    const existingPo = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { product: { include: { category: true } } },
    });

    if (!existingPo) {
      throw new CustomError(404, `Purchase Order with ID ${id} not found.`);
    }

    if (existingPo.status !== "PENDING") {
      throw new CustomError(
        400,
        `Cannot edit Purchase Order because its status is ${existingPo.status}.`,
      );
    }

    // Logic if productId is changing
    let productToValidate = existingPo.product;
    if (data.productId && data.productId !== existingPo.productId) {
      const newProduct = await prisma.product.findUnique({
        where: { id: data.productId },
        include: { category: true },
      });
      if (!newProduct) {
        throw new CustomError(
          404,
          `New Product with ID ${data.productId} not found.`,
        );
      }
      productToValidate = newProduct as any;
    }

    const expiryToCheck =
      data.expiryDate !== undefined ? data.expiryDate : existingPo.expiryDate;

    if (productToValidate.category?.hasExpiry && !expiryToCheck) {
      throw new CustomError(
        400,
        `Product category "${productToValidate.category.name}" requires an expiry date.`,
      );
    }

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(data.productId && { productId: data.productId }),
        ...(data.qty && { qty: Number(data.qty) }),
        ...(data.purchasePrice && { purchasePrice: data.purchasePrice }),
        ...(data.expiryDate !== undefined && {
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return updatedPo;
  },

  delete: async ({ id }: { id: string }) => {
    const existingPo = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingPo) {
      throw new CustomError(404, `Purchase Order with ID ${id} not found.`);
    }

    if (existingPo.status !== "PENDING") {
      throw new CustomError(
        400,
        `Cannot delete Purchase Order because its status is ${existingPo.status}. Only PENDING drafts can be deleted.`,
      );
    }

    return await prisma.purchaseOrder.delete({
      where: { id },
    });
  },

  approve: async ({ id, userId }: { id: string; userId: string }) => {
    const existingPo = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!existingPo) {
      throw new CustomError(404, `Purchase Order with ID ${id} not found.`);
    }

    if (existingPo.status !== "PENDING") {
      throw new CustomError(
        400,
        `Purchase Order is already ${existingPo.status}.`,
      );
    }

    const batchNumber = await generateBatchNumber();

    return await prisma.$transaction(async (tx) => {
      // 1. Mark PO as approved
      const approvedPo = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedById: userId,
        },
        include: {
          product: true,
        },
      });

      const { product, qty, purchasePrice, expiryDate } = approvedPo;

      // 2. Create StockBatch
      await tx.stockBatch.create({
        data: {
          productId: product.id,
          batchNumber,
          initialQuantity: qty,
          remainingQuantity: qty,
          purchasePrice,
          expiryDate: expiryDate,
        },
      });

      // 3. Increment Product stock and calculate new HPP average
      const currentValue = product.totalStock * product.hppAverage;
      const newValue = currentValue + qty * purchasePrice;
      const newTotalStock = product.totalStock + qty;
      const newHppAverage = newTotalStock > 0 ? newValue / newTotalStock : 0;

      await tx.product.update({
        where: { id: product.id },
        data: {
          totalStock: newTotalStock,
          hppAverage: newHppAverage,
        },
      });

      // 4. Run inventory logic syncs
      await checkLossAlert(tx, product.id);
      await syncBundleHpp(tx, product.id);

      return approvedPo;
    });
  },
};

export default purchaseOrderService;
