import z from "zod";
import { TransactionStatus } from "../../generated/prisma/enums.js";

const getAllTransactionSchema = z.object({
  query: z.object({
    limit: z.string().optional().default("10"),
    page: z.string().optional().default("1"),
    search: z.string().optional(),
  }),
});

const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createTransactionSchema = z.object({
  body: z
    .object({
      paymentMethod: z.string(),
      memberId: z.string().optional(),
      customerName: z.string().optional(),
      status: z
        .enum(TransactionStatus)
        .optional()
        .default(TransactionStatus.PENDING),
      cashReceived: z.number().optional(),
      items: z.array(
        z.object({
          productId: z.string(),
          qty: z.number().positive(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      if (data.status === "PENDING" && !data.customerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "customerName is required when status is PENDING",
          path: ["customerName"],
        });
      }

      if (data.paymentMethod === "CASH" && !data.cashReceived) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cashReceived is required when paymentMethod is CASH",
          path: ["cashReceived"],
        });
      }
    }),
});

const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const updatePendingTransactionSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      // Optional changes
      paymentMethod: z.string().optional(),
      memberId: z.string().optional(),
      customerName: z.string().optional(),
      cashReceived: z.number().optional(),
      items: z
        .array(
          z.object({
            productId: z.string(),
            qty: z.number().positive(),
          }),
        )
        .optional(),
      status: z.enum(TransactionStatus).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.status === "PENDING" && !data.customerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "customerName is required when status is PENDING",
          path: ["customerName"],
        });
      }

      if (data.paymentMethod === "CASH" && !data.cashReceived) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cashReceived is required when paymentMethod is CASH",
          path: ["cashReceived"],
        });
      }
    }),
});

const transactionSchema = {
  getAllTransactionSchema,
  getTransactionByIdSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  updatePendingTransactionSchema,
};

export default transactionSchema;
