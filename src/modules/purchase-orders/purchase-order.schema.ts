import { z } from "zod";

const createPurchaseOrderSchema = z.object({
  body: z.object({
    productId: z.string("ID Produk wajib diisi."),
    qty: z.coerce
      .number()
      .int()
      .positive({ message: "Kuantitas harus berupa bilangan bulat positif." }),
    purchasePrice: z.coerce
      .number()
      .positive({ message: "Harga beli harus lebih besar dari 0." }),
    expiryDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

const updatePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    productId: z.string().cuid().optional(),
    qty: z.coerce.number().int().positive().optional(),
    purchasePrice: z.coerce.number().positive().optional(),
    expiryDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

const getByIdPurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const getAllPurchaseOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    search: z.string().optional(),
  }),
});

const approvePurchaseOrderSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export default {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  getByIdPurchaseOrderSchema,
  getAllPurchaseOrdersSchema,
  approvePurchaseOrderSchema,
};
