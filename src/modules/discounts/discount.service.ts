import z from "zod";
import type discountSchema from "./discount.schema.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";

type getAllDiscountParams = z.infer<typeof discountSchema.getAllDiscountSchema>;
type getDiscountByIdParams = z.infer<
  typeof discountSchema.getDiscountByIdSchema
>;
type createDiscountParams = z.infer<typeof discountSchema.createDiscountSchema>;
type updateDiscountParams = z.infer<typeof discountSchema.updateDiscountSchema>;
type deleteDiscountParams = z.infer<typeof discountSchema.deleteDiscountSchema>;

const discountService = {
  getAllDiscount: async ({
    query,
  }: {
    query: getAllDiscountParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });
    const { search, isActive } = query;

    const where: Prisma.DiscountWhereInput = {};

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

  getDiscountById: async ({
    id,
  }: {
    id: getDiscountByIdParams["params"]["id"];
  }) => {
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
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Discount with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  createDiscount: async ({ data }: { data: createDiscountParams["body"] }) => {
    const { productIds, ...discountData } = data;

    if (discountData.type === "PERCENTAGE") {
      if (discountData.value > 100) {
        throw new CustomError(
          400,
          "Discount percentage cannot be greater than 100.",
        );
      }
    }

    if (!discountData.startDate) {
      discountData.startDate = new Date();
    }

    const start = new Date(discountData.startDate);
    const end = new Date(discountData.endDate);

    if(discountData.isTransactionLevel) {
      const overLapGlobal = await prisma.discount.findFirst({
        where: {
          isTransactionLevel: true,
          isMemberLevel: discountData.isMemberLevel,
          isActive: true,
          AND: [
            {startDate: {lte: end}},
            {endDate: {gte: start}}
          ]
        }
      });
      if (overLapGlobal) {
        throw new CustomError(400, "A global transaction discount already exists for this period.");
      }
    }

    if (productIds && productIds.length > 0) {
      const overLapProduct = await prisma.discount.findFirst({
        where: {
          isActive: true,
          isMemberLevel: discountData.isMemberLevel,
          products: {some: {id: {in: productIds}}},
          AND: [
            {startDate: {lte: end}},
            {endDate: {gte: start}}
          ]
        },
        include: {products: {select: {name: true}}}
      });
      if (overLapProduct) {
        throw new CustomError(400, `Conflict: One or more products already have an active discount for this period.`)
      }
    }

    const discount = await prisma.discount.create({
      data: {
        ...discountData,
        products: productIds
          ? {
              connect: productIds.map((id) => ({ id })),
            }
          : undefined,
      } as Prisma.DiscountCreateInput,
    });

    return discount;
  },

  updateDiscount: async ({
    id,
    data,
  }: {
    id: updateDiscountParams["params"]["id"];
    data: updateDiscountParams["body"];
  }) => {
    const { productIds, ...discountData } = data;

    if (discountData.type === "PERCENTAGE") {
      if (discountData.value && discountData.value > 100) {
        throw new CustomError(
          400,
          "Discount percentage cannot be greater than 100.",
        );
      }
    }

    const existingDiscount = await prisma.discount.findUnique({ where: { id } });
    if (!existingDiscount) {
        throw new CustomError(404, `Discount with ID ${id} not found.`);
    }

    const start = new Date(discountData.startDate || existingDiscount.startDate);
    const end = new Date(discountData.endDate || existingDiscount.endDate);
    const isMemberLevel = discountData.isMemberLevel || existingDiscount.isMemberLevel;
    
    if (discountData.isTransactionLevel) {
      const overlapGlobal = await prisma.discount.findFirst({
        where: {
          id: { not: id },
          isTransactionLevel: true,
          isMemberLevel: isMemberLevel,
          isActive: true,
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        }
      });
      if (overlapGlobal) throw new CustomError(400, "Conflict with another global discount period.");
    }

    if (productIds && productIds.length > 0) {
      const overlapProduct = await prisma.discount.findFirst({
        where: {
          id: { not: id },
          isActive: true,
          products: { some: { id: { in: productIds } } },
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        }
      });
      if (overlapProduct) throw new CustomError(400, "Conflict: Products already have an active discount in this period.");
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
        } as Prisma.DiscountUpdateInput,
      });

      return updatedDiscount;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `Discount with ID ${id} not found.`);
        }
      }
      throw err;
    }
  },

  deleteDiscount: async ({
    id,
  }: {
    id: deleteDiscountParams["params"]["id"];
  }) => {
    try {
      await prisma.discount.delete({
        where: {
          id,
        },
      });

      return {
        message: `Discount with ID ${id} has been deleted.`,
      };
    } catch (err) {
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
