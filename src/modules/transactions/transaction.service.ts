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
type updatePendingTransactionParams = z.infer<
  typeof transactionSchema.updatePendingTransactionSchema
>;

export async function deductStockFifo(
  tx: Prisma.TransactionClient,
  productId: string,
  qtyToDeduct: number,
) {
  const batches = await tx.stockBatch.findMany({
    where: { productId, remainingQuantity: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });

  let remaining = qtyToDeduct;
  for (const batch of batches) {
    if (remaining <= 0) break;
    const deductAmt = Math.min(batch.remainingQuantity, remaining);
    await tx.stockBatch.update({
      where: { id: batch.id },
      data: { remainingQuantity: { decrement: deductAmt } },
    });
    remaining -= deductAmt;
  }
}

export async function restockFifo(
  tx: Prisma.TransactionClient,
  productId: string,
  qtyToRestock: number,
) {
  const latestBatch = await tx.stockBatch.findFirst({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });

  if (latestBatch) {
    await tx.stockBatch.update({
      where: { id: latestBatch.id },
      data: { remainingQuantity: { increment: qtyToRestock } },
    });
  }
}

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
    posId,
  }: {
    data: createTransactionParams["body"];
    userId: string;
    posId?: string;
  }) => {
    const { memberId, items, paymentMethod, customerName, status } = data;
    const invoiceNumber = await generateInvoiceNumber();

    if (status === "PENDING" && (!customerName || customerName.trim() === "")) {
      throw new CustomError(
        400,
        "Customer name is required when status is PENDING",
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      let totalGross: number = 0;
      let totalDiscount: number = 0;
      let totalProfit: number = 0;
      let totalNet: number = 0;

      let member: any = null;
      if (memberId) {
        try {
          member = await tx.member.findUniqueOrThrow({
            where: {
              id: memberId,
            },
          });

          if (member.isActive === false) {
            throw new CustomError(400, `Member "${member.name}" is currently inactive and cannot be used for transactions.`);
          }

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
          // Atomic Lock: Ensure NO concurrent deduction on the same product
          const products = await tx.$queryRaw<
            any[]
          >`SELECT * FROM "Product" WHERE id = ${item.productId} FOR UPDATE`;
          if (products.length === 0) {
            throw new CustomError(
              404,
              `Product with ID ${item.productId} not found.`,
            );
          }
          product = products[0];

          // Re-fetch discounts needed for the logic below
          const productWithDiscounts = await tx.product.findUnique({
            where: { id: item.productId },
            include: { discount: true, bundleComponents: true },
          });
          product.discount = productWithDiscounts?.discount || [];
          product.bundleComponents =
            productWithDiscounts?.bundleComponents || [];
        } catch (err) {
          throw err;
        }

        if (product.isBundle) {
          for (const component of product.bundleComponents) {
            // Atomic Lock for components
            const components = await tx.$queryRaw<
              any[]
            >`SELECT * FROM "Product" WHERE id = ${component.componentId} FOR UPDATE`;
            if (components.length === 0) {
              throw new CustomError(
                404,
                `Component Product with ID ${component.componentId} not found.`,
              );
            }
            const compProduct = components[0];

            const neededQty = item.qty * component.qty;
            if (compProduct.totalStock < neededQty) {
              throw new CustomError(
                400,
                `Component Product ${compProduct.name} is out of stock for bundle ${product.name}.`,
              );
            }
            await tx.product.update({
              where: { id: component.componentId },
              data: {
                totalStock: {
                  decrement: neededQty,
                },
              },
            });
            await deductStockFifo(tx, component.componentId, neededQty);
          }
        } else {
          if (product.totalStock < item.qty) {
            throw new CustomError(
              400,
              `Product ${product.name} is out of stock.`,
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
            await deductStockFifo(tx, item.productId, item.qty);
          }
        }

        let totalItemDiscount: number = 0;
        const bestDiscountPerPcs = getBestItemDiscount(product);

        totalItemDiscount += bestDiscountPerPcs * item.qty;

        const totalItemGross = product.price * item.qty;
        const totalItemNet = totalItemGross - totalItemDiscount;
        totalDiscount += totalItemDiscount;
        totalGross += totalItemGross;
        totalProfit += totalItemNet - product.hppAverage * item.qty;

        transactionItems.push({
          productId: product.id,
          qty: item.qty,
          priceAtSale: product.price,
          hppAtSale: product.hppAverage,
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
          status,
          customerName: customerName ?? null,
          userId,
          posId: posId ?? null,
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
            items: {
              include: {
                product: {
                  include: {
                    bundleComponents: true,
                  },
                },
              },
            },
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
          const product = item.product;
          if (product.isBundle) {
            for (const component of product.bundleComponents) {
              const returnedQty = item.qty * component.qty;
              await tx.product.update({
                where: { id: component.componentId },
                data: {
                  totalStock: {
                    increment: returnedQty,
                  },
                },
              });
              await restockFifo(tx, component.componentId, returnedQty);
            }
          } else {
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
            await restockFifo(tx, item.productId, item.qty);
          }
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

  updatePendingTransaction: async ({
    id,
    data,
  }: {
    id: updatePendingTransactionParams["params"]["id"];
    data: updatePendingTransactionParams["body"];
  }) => {
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: { bundleComponents: true },
              },
            },
          },
        },
      });

      if (!transaction)
        throw new CustomError(404, `Transaction ${id} not found.`);
      if (transaction.status !== "PENDING") {
        throw new CustomError(400, "Only PENDING transactions can be updated.");
      }

      // Revert all original items
      for (const item of transaction.items) {
        if (item.product.isBundle) {
          for (const comp of item.product.bundleComponents) {
            const returnedQty = item.qty * comp.qty;
            await tx.product.update({
              where: { id: comp.componentId },
              data: { totalStock: { increment: returnedQty } },
            });
            await restockFifo(tx, comp.componentId, returnedQty);
          }
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { totalStock: { increment: item.qty } },
          });
          await restockFifo(tx, item.productId, item.qty);
        }
      }

      await tx.transactionItem.deleteMany({ where: { transactionId: id } });

      const finalItems =
        data.items ??
        transaction.items.map((i) => ({ productId: i.productId, qty: i.qty }));
      let finalMemberId = transaction.memberId;
      if (data.memberId !== undefined) {
        finalMemberId = data.memberId === "" ? null : data.memberId;
      }

      let member: any = null;
      if (finalMemberId) {
        member = await tx.member.findUnique({ where: { id: finalMemberId } });
        if (!member)
          throw new CustomError(404, `Member ${finalMemberId} not found.`);
      }

      if (member.isActive == false) {
        throw new CustomError(400, `Member "${member.name}" is inactive.`);
      }

      const activeDiscount = await tx.discount.findMany({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      let totalGross = 0;
      let totalDiscount = 0;
      let totalProfit = 0;
      let totalNet = 0;

      const transactionItems: any[] = [];
      for (const item of finalItems) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          include: { discount: true, bundleComponents: true },
        });

        if (product.isBundle) {
          for (const component of product.bundleComponents) {
            const neededQty = item.qty * component.qty;
            const compProduct = await tx.product.findUniqueOrThrow({
              where: { id: component.componentId },
            });
            if (compProduct.totalStock < neededQty)
              throw new CustomError(
                400,
                `Stock insufficient for bundle ${product.name}`,
              );

            await tx.product.update({
              where: { id: component.componentId },
              data: { totalStock: { decrement: neededQty } },
            });
            await deductStockFifo(tx, component.componentId, neededQty);
          }
        } else {
          if (product.totalStock < item.qty)
            throw new CustomError(400, `Product ${product.name} out of stock.`);
          await tx.product.update({
            where: { id: item.productId },
            data: { totalStock: { decrement: item.qty } },
          });
          await deductStockFifo(tx, item.productId, item.qty);
        }

        const now = new Date();
        const validDiscounts = product.discount.filter(
          (d: any) =>
            d.isActive &&
            now >= d.startDate &&
            now <= d.endDate &&
            (member ? d.isMemberLevel : true),
        );
        const discountAmounts = validDiscounts.map((d: any) =>
          calculateDiscountAmount(product.price, d),
        );
        const bestDiscountPerPcs = Math.max(...discountAmounts, 0);

        const totalItemDiscount = bestDiscountPerPcs * item.qty;
        const totalItemGross = product.price * item.qty;
        const totalItemNet = totalItemGross - totalItemDiscount;

        totalDiscount += totalItemDiscount;
        totalGross += totalItemGross;
        totalProfit += totalItemNet - product.hppAverage * item.qty;

        transactionItems.push({
          productId: product.id,
          qty: item.qty,
          priceAtSale: product.price,
          hppAtSale: product.hppAverage,
          totalDiscount: totalItemDiscount,
          subtotal: totalItemNet,
        });
      }

      const subtotalAfterItemDiscount = transactionItems.reduce(
        (acc, curr) => acc + curr.subtotal,
        0,
      );
      let transactionDiscountAmount = 0;
      const transactionDiscounts = activeDiscount.filter(
        (d) => d.isTransactionLevel && (member ? d.isMemberLevel : true),
      );
      transactionDiscounts.forEach((discount) => {
        transactionDiscountAmount += calculateDiscountAmount(
          subtotalAfterItemDiscount,
          discount,
        );
      });

      totalDiscount += transactionDiscountAmount;
      totalNet = totalGross - totalDiscount;
      totalProfit -= transactionDiscountAmount;

      return await tx.transaction.update({
        where: { id },
        data: {
          totalGross,
          totalDiscount,
          totalNet,
          totalProfit,
          paymentMethod: data.paymentMethod ?? transaction.paymentMethod,
          customerName:
            data.customerName !== undefined
              ? data.customerName
              : transaction.customerName,
          memberId: finalMemberId,
          items: {
            create: transactionItems,
          },
          status: data.status ?? transaction.status,
        },
        include: { items: true },
      });
    });
  },
};

export default transactionService;
