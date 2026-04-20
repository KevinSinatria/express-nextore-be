import z from "zod";
import { DiscountType } from "../../generated/prisma/enums.js";

const getAllDiscountSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
    isActive: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
  }),
});

const getDiscountByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createDiscountSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(DiscountType).optional().default(DiscountType.PERCENTAGE),
    value: z.number().min(0),
    startDate: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    endDate: z.string().transform((val) => new Date(val)),
    isActive: z.boolean().optional().default(true),
    isTransactionLevel: z.boolean().optional().default(false),
    isMemberLevel: z.boolean().optional().default(false),
    productIds: z.array(z.string()).optional(),
  }),
});

const updateDiscountSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(DiscountType).optional(),
    value: z.number().min(0).optional(),
    startDate: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    endDate: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    isActive: z.boolean().optional(),
    isTransactionLevel: z.boolean().optional(),
    isMemberLevel: z.boolean().optional(),
    productIds: z.array(z.string()).optional(),
  }),
});

const deleteDiscountSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const discountSchema = {
  getAllDiscountSchema,
  getDiscountByIdSchema,
  createDiscountSchema,
  updateDiscountSchema,
  deleteDiscountSchema,
};

export default discountSchema;
