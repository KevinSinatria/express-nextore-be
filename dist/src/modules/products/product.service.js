import z from "zod";
import productSchema from "./product.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { createPaginationMeta, getPaginationParams, } from "../../utils/pagination.js";
import { deleteImage, uploadImage } from "../../utils/cloudinary.js";
import { CustomError } from "../../utils/custom-error.js";
const productService = {
    getAllProducts: async ({ query, }) => {
        const { page, limit, skip } = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"),
        });
        const { search, categoryId } = query;
        const where = {};
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    sku: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    category: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ];
        }
        if (categoryId) {
            where.category = {
                id: categoryId,
            };
        }
        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit || 10,
                include: {
                    category: true,
                },
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const meta = createPaginationMeta(count, page, limit);
        return { data: products, meta };
    },
    getProductById: async ({ id, }) => {
        try {
            const product = await prisma.product.findUnique({
                where: {
                    id,
                },
                include: {
                    category: true,
                },
            });
            return product;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Product with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    createProduct: async ({ data, files, }) => {
        const { name, sku, hpp, price, stock, lowStockThreshold, categoryId } = data;
        let imageUrls = [];
        try {
            if (files && files.length > 0) {
                imageUrls = await Promise.all(files.map((file) => uploadImage(file.buffer, "products")));
            }
            const product = await prisma.product.create({
                data: {
                    name,
                    sku,
                    hpp: Number(hpp),
                    price: Number(price),
                    stock: Number(stock),
                    images: imageUrls,
                    lowStockThreshold: Number(lowStockThreshold),
                    categoryId,
                },
            });
            return product;
        }
        catch (err) {
            if (imageUrls.length > 0) {
                await Promise.all(imageUrls.map((url) => deleteImage(url)));
            }
            throw err;
        }
    },
    updateProduct: async ({ id, data, files, }) => {
        const { name, sku, hpp, price, stock, lowStockThreshold, categoryId } = data;
        let newImageUrls = null;
        try {
            const existingProduct = await prisma.product.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            const oldImageUrls = existingProduct.images;
            if (files && files.length > 0) {
                newImageUrls = await Promise.all(files.map((file) => uploadImage(file.buffer, "products")));
            }
            const product = await prisma.product.update({
                where: {
                    id,
                },
                data: {
                    name,
                    sku,
                    hpp: Number(hpp),
                    price: Number(price),
                    stock: Number(stock),
                    lowStockThreshold: Number(lowStockThreshold),
                    categoryId,
                    ...(newImageUrls && { images: newImageUrls }),
                },
            });
            if (newImageUrls && oldImageUrls.length > 0) {
                Promise.all(oldImageUrls.map((url) => deleteImage(url))).catch(console.error);
            }
            return product;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Product with ID ${id} not found.`);
                }
            }
            if (newImageUrls && newImageUrls.length > 0) {
                await Promise.all(newImageUrls.map((url) => deleteImage(url)));
            }
            throw err;
        }
    },
    deleteProduct: async ({ id, }) => {
        try {
            const product = await prisma.product.delete({
                where: {
                    id,
                },
            });
            if (product.images.length > 0) {
                Promise.all(product.images.map((url) => deleteImage(url))).catch(console.error);
            }
            return product;
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2025") {
                    throw new CustomError(404, `Product with ID ${id} not found.`);
                }
            }
            throw err;
        }
    },
    alertLowStock: async () => {
        const products = await prisma.product.findMany({
            where: {
                stock: {
                    lt: prisma.product.fields.lowStockThreshold,
                },
            },
        });
        return products;
    },
};
export default productService;
//# sourceMappingURL=product.service.js.map