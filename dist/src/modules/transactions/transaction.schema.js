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
    body: z.object({
        paymentMethod: z.string(),
        memberId: z.string().optional(),
        status: z
            .enum(TransactionStatus)
            .optional()
            .default(TransactionStatus.PENDING),
        items: z.array(z.object({
            productId: z.string(),
            qty: z.number(),
        })),
    }),
});
const deleteTransactionSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
const transactionSchema = {
    getAllTransactionSchema,
    getTransactionByIdSchema,
    createTransactionSchema,
    deleteTransactionSchema,
};
export default transactionSchema;
//# sourceMappingURL=transaction.schema.js.map