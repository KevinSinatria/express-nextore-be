import { createPaginationMeta, getPaginationParams, } from "../../utils/pagination.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
const discountService = {
    getAllDiscount: async ({ query, }) => {
        const { page, limit, skip } = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"),
        });
        const { search, isActive } = query;
        const where = {};
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [discounts, count] = await Promise.all([
            prisma.discount.findMany({
                where,
                skip,
                take: limit || 10,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    products: true,
                },
            }),
            prisma.discount.count({
                where,
            }),
        ]);
        const meta = createPaginationMeta(count, page, limit);
        return { data: discounts, meta };
    },
    getDiscountById: async ({ id, }) => {
        try {
            const discount = await prisma.discount.findUnique({
                where: {
                    id,
                },
                include: {
                    products: true,
                },
            });
            return discount;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Discount with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    createDiscount: async ({ data }) => {
        const { productIds, ...discountData } = data;
        if (discountData.type === "PERCENTAGE") {
            if (discountData.value > 100) {
                throw new CustomError(400, "Discount percentage cannot be greater than 100.");
            }
        }
        if (!discountData.startDate) {
            discountData.startDate = new Date();
        }
        const discount = await prisma.discount.create({
            data: {
                ...discountData,
                products: productIds
                    ? {
                        connect: productIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
        });
        return discount;
    },
    updateDiscount: async ({ id, data, }) => {
        const { productIds, ...discountData } = data;
        if (discountData.type === "PERCENTAGE") {
            if (discountData.value && discountData.value > 100) {
                throw new CustomError(400, "Discount percentage cannot be greater than 100.");
            }
        }
        if (!discountData.startDate) {
            discountData.startDate = new Date();
        }
        try {
            const updatedDiscount = await prisma.discount.update({
                where: {
                    id,
                },
                data: {
                    ...discountData,
                    products: productIds
                        ? {
                            set: productIds.map((id) => ({ id })),
                        }
                        : undefined,
                },
            });
            return updatedDiscount;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Discount with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    deleteDiscount: async ({ id, }) => {
        try {
            await prisma.discount.delete({
                where: {
                    id,
                },
            });
            return {
                message: `Discount with ID ${id} has been deleted.`,
            };
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Discount with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
};
export default discountService;
//# sourceMappingURL=discount.service.js.map