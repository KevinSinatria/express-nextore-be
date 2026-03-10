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

  getProductById: async ({
    id,
  }: {
    id: GetProductByIdParams["params"]["id"];
  }) => {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new CustomError(404, `Product with ID ${id} not found.`);
    }

    return product;
  },

  createProduct: async ({
    data,
    file,
  }: {
    data: CreateProductParams["body"];
    file: Express.Multer.File | undefined;
  }) => {
    const { name, sku, hpp, price, stock, lowStockThreshold, categoryId } =
      data;
    let imageUrl: string | null = null;

    try {
      imageUrl = file ? await uploadImage(file.buffer, "products") : null;
      const product = await prisma.product.create({
        data: {
          name,
          sku,
          hpp: Number(hpp),
          price: Number(price),
          stock: Number(stock),
          image_url: imageUrl,
          lowStockThreshold: Number(lowStockThreshold),
          categoryId,
        },
      });

      return product;
    } catch (err) {
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      throw err;
    }
  },

  updateProduct: async ({
    id,
    data,
    file,
  }: {
    id: UpdateProductParams["params"]["id"];
    data: UpdateProductParams["body"];
    file: Express.Multer.File | undefined;
  }) => {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      throw new CustomError(404, `Product with ID ${id} not found.`);
    }

    const { name, sku, hpp, price, stock, lowStockThreshold, categoryId } =
      data;
    let newImageUrl: string | null = null;
    const oldImageUrl = existingProduct.image_url;

    try {
      if (file) {
        newImageUrl = await uploadImage(file.buffer, "products");
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
          image_url: newImageUrl,
        },
      });

      if (file && oldImageUrl) {
        await deleteImage(oldImageUrl);
      }

      return product;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Product with ID ${id} not found.`);
        }
      }

      if (newImageUrl) {
        await deleteImage(newImageUrl);
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

      if (product.image_url) {
        await deleteImage(product.image_url);
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
