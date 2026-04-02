import z from "zod";
import categorySchema from "./category.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";

type GetAllCategoriesParams = z.infer<
  typeof categorySchema.getAllCategoriesSchema
>;
type GetCategoryByIdParams = z.infer<
  typeof categorySchema.getCategoryByIdSchema
>;
type CreateCategoryParams = z.infer<typeof categorySchema.createCategorySchema>;
type UpdateCategoryParams = z.infer<typeof categorySchema.updateCategorySchema>;
type DeleteCategoryParams = z.infer<typeof categorySchema.deleteCategorySchema>;

const categoryService = {
  getAllCategories: async ({
    query,
  }: {
    query: GetAllCategoriesParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search } = query;

    const where: Prisma.CategoryWhereInput = {};

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

  getCategoryById: async ({
    id,
  }: {
    id: GetCategoryByIdParams["params"]["id"];
  }) => {
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Category with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  createCategory: async ({ data }: { data: CreateCategoryParams["body"] }) => {
    const { name, hasExpiry } = data;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        hasExpiry,
      },
    });

    return category;
  },

  updateCategory: async ({
    id,
    data,
  }: {
    id: UpdateCategoryParams["params"]["id"];
    data: UpdateCategoryParams["body"];
  }) => {
    const { name, hasExpiry } = data;
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    try {
      const category = await prisma.category.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
          hasExpiry,
        },
      });

      return category;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Category with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  deleteCategory: async ({
    id,
  }: {
    id: DeleteCategoryParams["params"]["id"];
  }) => {
    try {
      const category = await prisma.category.delete({
        where: {
          id,
        },
      });

      return category;
    } catch (err) {
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
