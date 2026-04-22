import z from "zod";
import productSchema from "./product.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { deleteImage, uploadImage } from "../../utils/cloudinary.js";
import { CustomError } from "../../utils/custom-error.js";
import categoryRoute from "../categories/category.route.js";

type GetAllProductsParams = z.infer<typeof productSchema.getAllProductsSchema>;
type GetProductByIdParams = z.infer<typeof productSchema.getProductByIdSchema>;
type CreateProductParams = z.infer<typeof productSchema.createProductSchema>;
type UpdateProductParams = z.infer<typeof productSchema.updateProductSchema>;
type DeleteProductParams = z.infer<typeof productSchema.deleteProductSchema>;

const productService = {
  getAllProducts: async ({
    query,
  }: {
    query: GetAllProductsParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search, categoryId } = query;

    const where: Prisma.ProductWhereInput = {};

    where.isBundle = false;

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
          asComponentIn: {
            include: {
              bundleProduct: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          stockBatches: true,
        },
      }),
      prisma.product.count({
        where,
      }),
    ]);

    // Active PriceList Substitution
    const activePriceList = await prisma.priceList.findFirst({
      where: { isActive: true },
      include: { items: true },
    });
    if (activePriceList && products.length > 0) {
      const overrideMap = new Map(
        activePriceList.items.map((i) => [i.productId, i.newPrice]),
      );
      products.forEach((p) => {
        if (overrideMap.has(p.id)) {
          p.price = overrideMap.get(p.id)!;
        }
      });
    }

    const meta = createPaginationMeta(count, page, limit);
    return { data: products, meta };
  },

  getProductById: async ({
    id,
  }: {
    id: GetProductByIdParams["params"]["id"];
  }) => {
    try {
      const product = await prisma.product.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          category: true,
          asComponentIn: {
            include: {
              bundleProduct: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          stockBatches: true,
        },
      });

      // Active PriceList Substitution
      if (product) {
        const activePriceList = await prisma.priceList.findFirst({
          where: { isActive: true },
          include: { items: true },
        });
        if (activePriceList) {
          const matchingItem = activePriceList.items.find(
            (i) => i.productId === product.id,
          );
          if (matchingItem) {
            product.price = matchingItem.newPrice;
          }
        }
      }

      return product;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Product with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  createProduct: async ({
    data,
    files,
  }: {
    data: CreateProductParams["body"];
    files: Express.Multer.File[] | undefined;
  }) => {
    const { name, sku, price, lowStockThreshold, categoryId, unit } = data;
    let imageUrls: string[] = [];

    try {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        throw new CustomError(404, `Category with ID ${categoryId} not found.`);
      }

      if (files && files.length > 0) {
        imageUrls = await Promise.all(
          files.map((file) => uploadImage(file.buffer, "products")),
        );
      }

      const product = await prisma.product.create({
        data: {
          name,
          sku,
          hppAverage: 0,
          price: Number(price),
          totalStock: 0,
          unit,
          images: imageUrls,
          lowStockThreshold: Number(lowStockThreshold),
          categoryId,
        },
      });

      return product;
    } catch (err) {
      if (imageUrls.length > 0) {
        await Promise.all(imageUrls.map((url) => deleteImage(url)));
      }
      throw err;
    }
  },

  updateProduct: async ({
    id,
    data,
    files,
    userId,
  }: {
    id: UpdateProductParams["params"]["id"];
    data: UpdateProductParams["body"];
    files: Express.Multer.File[] | undefined;
    userId: string;
  }) => {
    const { name, sku, price, lowStockThreshold, categoryId, unit } = data;
    let newImageUrls: string[] | null = null;

    try {
      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        throw new CustomError(404, `Category with ID ${categoryId} not found.`);
      }

      const existingProduct = await prisma.product.findUnique({
        where: {
          id,
        },
      });
      const oldImageUrls = existingProduct?.images;

      if (files && files.length > 0) {
        newImageUrls = await Promise.all(
          files.map((file) => uploadImage(file.buffer, "products")),
        );
      }

      const product = await prisma.product.update({
        where: {
          id,
        },
        data: {
          name,
          sku,
          price: Number(price),
          lowStockThreshold: Number(lowStockThreshold),
          categoryId,
          unit,
          ...(newImageUrls && { images: newImageUrls }),
        },
      });

      await prisma.productPriceHistory.create({
        data: {
          productId: id,
          oldPrice: existingProduct?.price ?? 0,
          newPrice: Number(price),
          userId: userId,
          changedAt: new Date(),
        },
      });

      if (newImageUrls && oldImageUrls!.length > 0) {
        Promise.all(oldImageUrls!.map((url) => deleteImage(url))).catch(
          console.error,
        );
      }

      return product;
    } catch (err) {
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

  deleteProduct: async ({
    id,
  }: {
    id: DeleteProductParams["params"]["id"];
  }) => {
    try {
      const product = await prisma.product.delete({
        where: {
          id,
        },
      });

      if (product.images.length > 0) {
        Promise.all(product.images.map((url) => deleteImage(url))).catch(
          console.error,
        );
      }
      return product;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Product with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  alertLowStock: async ({ query }: { query: { search?: string } }) => {
    const { search } = query;

    const where: Prisma.ProductWhereInput = {
      totalStock: {
        lte: prisma.product.fields.lowStockThreshold,
      },
      isBundle: false,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        stockBatches: true,
      },
      orderBy: {
        totalStock: "asc",
      },
    });

    return products;
  },

  getProductPriceHistories: async ({
    id,
  }: {
    id: GetProductByIdParams["params"]["id"];
  }) => {
    try {
      const productPriceHistories = await prisma.productPriceHistory.findMany({
        where: {
          productId: id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          changedAt: "desc",
        },
      });

      return productPriceHistories;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Product with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },
};

export default productService;
