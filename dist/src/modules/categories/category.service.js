import z from "zod";
import categorySchema from "./category.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { createPaginationMeta, getPaginationParams, } from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";
const categoryService = {
    getAllCategories: async ({ query, }) => {
        const { page, limit, skip } = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"),
        });
        const { search } = query;
        const where = {};
        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }
        const [categories, count] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit || 10,
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
            }),
            prisma.category.count({
                where,
            }),
        ]);
        const meta = createPaginationMeta(count, page, limit);
        return { data: categories, meta };
    },
    getCategoryById: async ({ id, }) => {
        try {
            const category = await prisma.category.findUnique({
                where: {
                    id,
                },
                include: {
                    products: true,
                },
            });
            return category;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Category with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    createCategory: async ({ data }) => {
        const { name } = data;
        const category = await prisma.category.create({
            data: {
                name,
            },
        });
        return category;
    },
    updateCategory: async ({ id, data, }) => {
        const { name } = data;
        try {
            const category = await prisma.category.update({
                where: {
                    id,
                },
                data: {
                    name,
                },
            });
            return category;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Category with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    deleteCategory: async ({ id, }) => {
        try {
            const category = await prisma.category.delete({
                where: {
                    id,
                },
            });
            return category;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Category with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
};
export default categoryService;
//# sourceMappingURL=category.service.js.map