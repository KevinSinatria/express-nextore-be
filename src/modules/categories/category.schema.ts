import z from "zod";

const getAllCategoriesSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
  }),
});

const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    hasExpiry: z.boolean().optional().default(false),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    hasExpiry: z.boolean().optional(),
  }),
});

const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const categorySchema = {
  getAllCategoriesSchema,
  getCategoryByIdSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
};

export default categorySchema;
