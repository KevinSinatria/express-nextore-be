import { createPaginationMeta, getPaginationParams, } from "../../utils/pagination.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
import { generateInvoiceNumber } from "../../utils/generateInvoiceNum.js";
import { calculateDiscountedPrice } from "../../utils/calculator.js";
const transactionService = {
    getAllTransaction: async ({ query, }) => {
        const { page, limit, skip } = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"),
        });
        const { search } = query;
        const where = {};
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
    getTransactionById: async ({ id, }) => {
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
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Transaction with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    createTransaction: async ({ data, userId, }) => {
        const { memberId, items, paymentMethod } = data;
        const invoiceNumber = await generateInvoiceNumber();
        const transaction = await prisma.$transaction(async (tx) => {
            let totalGross = 0;
            let totalDiscount = 0;
            let totalProfit = 0;
            let totalNet = 0;
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
            const transactionItems = [];
            for (const item of items) {
                const getActiveItemDiscount = (product) => {
                    const now = new Date();
                    if (!product.discount || product.discount.length === 0) {
                        return null;
                    }
                    return product.discount.find((d) => d.isActive && now >= d.startDate && now <= d.endDate);
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
                }
                catch (err) {
                    if (err instanceof Prisma.PrismaClientKnownRequestError &&
                        err.code === "P2025") {
                        throw new CustomError(404, `Product with ID ${item.productId} not found.`);
                    }
                    throw err;
                }
                if (product.stock < item.qty) {
                    throw new CustomError(400, `Product with ID ${item.productId} is out of stock.`);
                }
                let totalItemDiscount = 0;
                const itemDiscounts = getActiveItemDiscount(product);
                if (itemDiscounts) {
                    for (const discount of itemDiscounts) {
                        totalItemDiscount += calculateDiscountedPrice(product.price, discount);
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
                let member;
                try {
                    member = await tx.member.findUniqueOrThrow({
                        where: {
                            id: memberId,
                        },
                    });
                }
                catch (err) {
                    if (err instanceof Prisma.PrismaClientKnownRequestError &&
                        err.code === "P2025") {
                        throw new CustomError(404, `Member with ID ${memberId} not found.`);
                    }
                    throw err;
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
    deleteTransaction: async ({ id, }) => {
        try {
            await prisma.transaction.delete({
                where: {
                    id,
                },
            });
            return {
                message: `Transaction with ID ${id} has been deleted.`,
            };
        }
        catch (err) {
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
//# sourceMappingURL=transaction.service.js.map