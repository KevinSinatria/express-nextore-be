import z from "zod";

const getSalesAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    posId: z.string().optional(),
    format: z.enum(["json", "csv", "excel", "pdf"]).optional().default("json"),
  }),
});

const getSalesAuditTrailSchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    posId: z.string().optional(),
    format: z.enum(["json", "csv", "excel", "pdf"]).optional().default("json"),
  }),
});

const getInventoryExpirySchema = z.object({
  query: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    format: z.enum(["json", "csv", "excel", "pdf"]).optional().default("json"),
  }),
});

const reportSchema = {
  getSalesAnalyticsSchema,
  getSalesAuditTrailSchema,
  getInventoryExpirySchema,
};

export default reportSchema;
