import z from "zod";

const getAllProductsSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
    categoryId: z.string().optional(),
  }),
});

const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    sku: z.string().min(3).max(100),
    price: z.coerce.number(),
    lowStockThreshold: z.coerce.number(),
    categoryId: z.string(),
  }),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(3).max(100),
    sku: z.string().min(3).max(100),
    price: z.coerce.number(),
    lowStockThreshold: z.coerce.number(),
    categoryId: z.string(),
  }),
});

const deleteProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const productSchema = {
  getAllProductsSchema,
  getProductByIdSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
};

export default productSchema;
