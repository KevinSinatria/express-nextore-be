import z from "zod";

const getAllBundlesSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
    categoryId: z.string().optional(),
  }),
});

const getBundleByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createBundleSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    sku: z.string().min(3).max(100),
    price: z.coerce.number(),
    categoryId: z.string(),
    description: z.string().optional(),
    components: z
      .array(
        z.object({
          componentId: z.string(),
          qty: z.number().int().positive(),
        }),
      )
      .min(1, "A bundle must have at least one component"),
  }),
});

const updateBundleSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    sku: z.string().min(3).max(100).optional(),
    price: z.coerce.number().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    components: z
      .array(
        z.object({
          componentId: z.string(),
          qty: z.number().int().positive(),
        }),
      )
      .optional(),
  }),
});

const deleteBundleSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const bundleSchema = {
  getAllBundlesSchema,
  getBundleByIdSchema,
  createBundleSchema,
  updateBundleSchema,
  deleteBundleSchema,
};

export default bundleSchema;
