import type z from "zod";
import type transactionSchema from "./transaction.schema.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
import { generateInvoiceNumber } from "../../utils/generateInvoiceNum.js";
import { calculateDiscountedPrice } from "../../utils/calculator.js";

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

    if (!transaction) {
      throw new CustomError(404, `Transaction with ID ${id} not found.`);
    }

    return transaction;
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

      const getActiveTransactionDiscount = async () => {
        const now = new Date();
        return tx.discount.findMany({
          where: {
            isTransactionLevel: true,
            isActive: true,
            startDate: {
              lte: now,
            },
            endDate: {
              gte: now,
            },
          },
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
        const getActiveItemDiscount = (product: any) => {
          const now = new Date();

          if (!product.discount || product.discount.length === 0) {
            return null;
          }

          return product.discount.find(
            (d: any) => d.isActive && now >= d.startDate && now <= d.endDate,
          );
        };

        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
          include: {
            discount: true,
          },
        });

        if (!product) {
          throw new CustomError(
            404,
            `Product with ID ${item.productId} not found.`,
          );
        }

        if (product.stock < item.qty) {
          throw new CustomError(
            400,
            `Product with ID ${item.productId} is out of stock.`,
          );
        }

        let totalItemDiscount: number = 0;
        const itemDiscounts = getActiveItemDiscount(product);

        if (itemDiscounts) {
          for (const discount of itemDiscounts) {
            totalItemDiscount += calculateDiscountedPrice(
              product.price,
              discount,
            );
          }
        }

        const totalItemGross = product.price * item.qty;
        const totalItemNet = totalItemGross - totalItemDiscount;
        totalDiscount += totalItemDiscount;
        totalGross += totalItemGross;
        totalNet += totalItemGross - totalItemDiscount;
        totalProfit += totalItemNet - product.hpp * item.qty;

        transactionItems.push({
          productId: product.id,
          qty: item.qty,
          priceAtSale: product.price,
          hppAtSale: product.hpp,
          totalDiscount: totalItemDiscount,
          subtotal: totalItemGross - totalItemDiscount,
        });
      }

      const transactionDiscounts = await getActiveTransactionDiscount();
      transactionDiscounts.forEach((discount) => {
        totalDiscount += calculateDiscountedPrice(totalGross, discount);
      });

      totalNet = totalGross - totalDiscount;

      if (memberId) {
        const member = await tx.member.findUnique({
          where: {
            id: memberId,
          },
        });

        if (!member) {
          throw new CustomError(404, `Member with ID ${memberId} not found.`);
        }

        await tx.member.update({
          where: {
            id: memberId,
          },
          data: {
            points: member.points + Math.floor(totalNet / 1000),
          },
        });
      }

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
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: {
          id,
        },
      });

      if (!transaction) {
        throw new CustomError(404, `Transaction with ID ${id} not found.`);
      }

      await tx.transaction.delete({
        where: {
          id,
        },
      });
    });

    return {
      message: `Transaction with ID ${id} has been deleted.`,
    };
  },
};

export default transactionService;
