import z from "zod";

const getAllStockBatchesSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
    productId: z.string().optional(),
  }),
});

const getStockBatchByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createStockBatchSchema = z.object({
  body: z.object({
    productId: z.string(),
    initialQuantity: z.coerce.number().int().positive(),
    purchasePrice: z.coerce.number().positive(),
    expiryDate: z.string().datetime().optional().nullable(),
  }),
});

const updateStockBatchSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    purchasePrice: z.coerce.number().positive().optional(),
    expiryDate: z.string().optional().nullable(),
  }),
});

const deleteStockBatchSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const stockBatchSchema = {
  getAllStockBatchesSchema,
  getStockBatchByIdSchema,
  createStockBatchSchema,
  updateStockBatchSchema,
  deleteStockBatchSchema,
};

export default stockBatchSchema;
