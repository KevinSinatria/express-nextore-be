import prisma from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type z from "zod";
import type priceListSchema from "./price-list.schema.js";
import { CustomError } from "../../utils/custom-error.js";

type CreatePriceListParams = z.infer<
  typeof priceListSchema.createPriceListSchema
>["body"];
type UpdatePriceListParams = z.infer<
  typeof priceListSchema.updatePriceListSchema
>["body"];
type GetPriceListsQueryParams = z.infer<
  typeof priceListSchema.getAllPriceListsSchema
>["query"];

const priceListService = {
  create: async (data: CreatePriceListParams) => {
    const { items, name, description } = data;
    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
      select: {
        id: true,
      },
    });

    if (existingProducts.length !== items.length) {
      throw new CustomError(404, "Some products do not exist");
    }

    return await prisma.priceList.create({
      data: {
        name,
        description: description ?? null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            newPrice: item.newPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  },

  getAll: async ({ query }: { query: GetPriceListsQueryParams }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });

    const where: Prisma.PriceListWhereInput = {};
    if (query.name) {
      where.name = { contains: query.name, mode: "insensitive" };
    }

    const [data, count] = await Promise.all([
      prisma.priceList.findMany({
        where,
        skip,
        take: limit ?? 10,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.priceList.count({ where }),
    ]);

    const meta = createPaginationMeta(
      count,
      parseInt(query.page || "1"),
      limit,
    );
    return { data, meta };
  },

  getActive: async () => {
    const priceList = await prisma.priceList.findFirst({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!priceList) {
      return null;
    }

    return priceList;
  },

  getById: async (id: string) => {
    return await prisma.priceList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });
  },

  update: async (id: string, data: UpdatePriceListParams) => {
    return await prisma.$transaction(async (tx) => {
      // If items are provided, delete old ones and create new
      if (data.items) {
        await tx.priceListItem.deleteMany({
          where: { priceListId: id },
        });
      }

      return await tx.priceList.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.items && {
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                newPrice: item.newPrice,
              })),
            },
          }),
        },
        include: {
          items: true,
        },
      });
    });
  },

  delete: async (id: string) => {
    return await prisma.priceList.delete({
      where: { id },
    });
  },

  activate: async (id: string) => {
    return await prisma.$transaction(async (tx) => {
      // Deactivate all first
      await tx.priceList.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Activate the targeted one
      return await tx.priceList.update({
        where: { id },
        data: { isActive: true },
      });
    });
  },

  deactivateAll: async () => {
    return await prisma.priceList.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  },
};

export default priceListService;
