import type z from "zod";
import type transactionSchema from "./transaction.schema.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import {
  Prisma,
  type Member,
  type Product,
} from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
import { generateInvoiceNumber } from "../../utils/generateInvoiceNum.js";
import {
  calculateDiscountAmount,
  calculateDiscountedPrice,
} from "../../utils/calculator.js";

type getAllTransactionParams = z.infer<
  typeof transactionSchema.getAllTransactionSchema
>;
type getTransactionByIdParams = z.infer<
  typeof transactionSchema.getTransactionByIdSchema
>;
type createTransactionParams = z.infer<
  typeof transactionSchema.createTransactionSchema
>;
type deleteTransactionParams = z.infer<
  typeof transactionSchema.deleteTransactionSchema
>;

const transactionService = {
  getAllTransaction: async ({
    query,
  }: {
    query: getAllTransactionParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search } = query;

    const where: Prisma.TransactionWhereInput = {};

    if (search) {
      where.OR = [
        {
          invoiceNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [transactions, count] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit || 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.transaction.count({
        where,
      }),
    ]);

    const meta = createPaginationMeta(count, page, limit);
    return { data: transactions, meta };
  },

  getTransactionById: async ({
    id,
  }: {
    id: getTransactionByIdParams["params"]["id"];
  }) => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
          member: true,
        },
      });

      return transaction;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Transaction with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  createTransaction: async ({
    data,
    userId,
  }: {
    data: createTransactionParams["body"];
    userId: string;
  }) => {
    const { memberId, items, paymentMethod } = data;
    const invoiceNumber = await generateInvoiceNumber();

    const transaction = await prisma.$transaction(async (tx) => {
      let totalGross: number = 0;
      let totalDiscount: number = 0;
      let totalProfit: number = 0;
      let totalNet: number = 0;

      let member: Member | null = null;
      if (memberId) {
        try {
          member = await tx.member.findUniqueOrThrow({
            where: {
              id: memberId,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new CustomError(404, `Member with ID ${memberId} not found.`);
          }
          throw err;
        }
      }

      const activeDiscount = await tx.discount.findMany({
        where: {
          isActive: true,
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
      });

      const getActiveTransactionDiscount = async () => {
        const now = new Date();
        return activeDiscount.filter((d) => {
          return (
            d.isTransactionLevel &&
            now >= d.startDate &&
            now <= d.endDate &&
            (member ? d.isMemberLevel : true)
          );
        });
      };

      const transactionItems: {
        productId: string;
        qty: number;
        priceAtSale: number;
        hppAtSale: number;
        totalDiscount: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const getBestItemDiscount = (product: any) => {
          const now = new Date();

          const validDiscounts = product.discount.filter(
            (d: any) =>
              d.isActive &&
              now >= d.startDate &&
              now <= d.endDate &&
              (member ? d.isMemberLevel : true),
          );

          if (validDiscounts.length === 0) return 0;

          const discountAmounts = validDiscounts.map((d: any) =>
            calculateDiscountAmount(product.price, d),
          );

          return Math.max(...discountAmounts) || 0;
        };

        let product;
        try {
          product = await tx.product.findUniqueOrThrow({
            where: {
              id: item.productId,
            },
            include: {
              discount: true,
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
          ) {
            throw new CustomError(
              404,
              `Product with ID ${item.productId} not found.`,
            );
          }
          throw err;
        }

        if (product.totalStock < item.qty) {
          throw new CustomError(
            400,
            `Product with ID ${item.productId} is out of stock.`,
          );
        } else {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              totalStock: {
                decrement: item.qty,
              },
            },
          });
        }

        let totalItemDiscount: number = 0;
        const bestDiscountPerPcs = getBestItemDiscount(product);

        totalItemDiscount += bestDiscountPerPcs * item.qty;

        const totalItemGross = product.price * item.qty;
        const totalItemNet = totalItemGross - totalItemDiscount;
        totalDiscount += totalItemDiscount;
        totalGross += totalItemGross;
        totalProfit += totalItemNet - product.hpp * item.qty;

        transactionItems.push({
          productId: product.id,
          qty: item.qty,
          priceAtSale: product.price,
          hppAtSale: product.hpp,
          totalDiscount: totalItemDiscount,
          subtotal: totalItemNet,
        });
      }

      const subtotalAfterItemDiscount = transactionItems.reduce(
        (total, item) => total + item.subtotal,
        0,
      );

      let transactionDiscountAmount = 0;
      const transactionDiscounts = await getActiveTransactionDiscount();
      transactionDiscounts.forEach((discount) => {
        transactionDiscountAmount += calculateDiscountAmount(
          subtotalAfterItemDiscount,
          discount,
        );
      });

      totalDiscount += transactionDiscountAmount;
      totalNet = totalGross - totalDiscount;
      totalProfit -= transactionDiscountAmount;

      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          totalGross,
          totalDiscount,
          totalNet,
          totalProfit,
          paymentMethod,
          userId,
          memberId: memberId ?? null,
          items: {
            create: transactionItems,
          },
        },
      });

      return transaction;
    });

    return transaction;
  },

  deleteTransaction: async ({
    id,
  }: {
    id: deleteTransactionParams["params"]["id"];
  }) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.findUnique({
          where: {
            id,
          },
          select: {
            items: true,
            status: true,
          },
        });

        if (!transaction) {
          throw new CustomError(404, `Transaction with ID ${id} not found.`);
        }

        if (transaction.status === "CANCELLED") {
          throw new CustomError(
            400,
            `Transaction with ID ${id} is already cancelled.`,
          );
        }

        for (const item of transaction.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              totalStock: {
                increment: item.qty,
              },
            },
          });
        }

        await tx.transaction.update({
          where: {
            id,
          },
          data: {
            status: "CANCELLED",
          },
        });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Transaction with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },
};

export default transactionService;
