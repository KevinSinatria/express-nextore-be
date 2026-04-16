import { z } from "zod";

const priceListItemSchema = z.object({
  productId: z.string().cuid({ message: "Invalid product ID format." }),
  newPrice: z.number().min(0, { message: "Price must be at least 0." }),
});

const createPriceListSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    items: z.array(priceListItemSchema).optional().default([]),
  }),
});

const updatePriceListSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid ID format." }),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    items: z.array(priceListItemSchema).optional(),
  }),
});

const getByIdPriceListSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Invalid ID format." }),
  }),
});

const getAllPriceListsSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    name: z.string().optional(),
  }),
});

export default {
  createPriceListSchema,
  updatePriceListSchema,
  getByIdPriceListSchema,
  getAllPriceListsSchema,
};
