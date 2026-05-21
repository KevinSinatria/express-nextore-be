import { z } from "zod";

const priceListItemSchema = z.object({
  productId: z.string().cuid({ message: "Format ID produk tidak valid." }),
  newPrice: z.number().min(0, { message: "Harga tidak boleh lebih kecil dari 0." }),
});

const createPriceListSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    description: z.string().optional(),
    items: z.array(priceListItemSchema).optional().default([]),
  }),
});

const updatePriceListSchema = z.object({
  params: z.object({
    id: z.string({ message: "Format ID tidak valid." }),
  }),
  body: z.object({
    name: z.string().min(1, "Nama wajib diisi").optional(),
    description: z.string().optional(),
    items: z.array(priceListItemSchema).optional(),
  }),
});

const getByIdPriceListSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: "Format ID tidak valid." }),
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
