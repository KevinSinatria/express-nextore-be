import z from "zod";
declare const transactionSchema: {
    getAllTransactionSchema: z.ZodObject<{
        query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            search: z.ZodOptional<z.ZodString>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    getTransactionByIdSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    createTransactionSchema: z.ZodObject<{
        body: z.ZodObject<{
            paymentMethod: z.ZodString;
            memberId: z.ZodOptional<z.ZodString>;
            status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                readonly COMPLETED: "COMPLETED";
                readonly PENDING: "PENDING";
                readonly CANCELLED: "CANCELLED";
            }>>>;
            items: z.ZodArray<z.ZodObject<{
                productId: z.ZodString;
                qty: z.ZodNumber;
            }, z.z.core.$strip>>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    deleteTransactionSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
};
export default transactionSchema;
//# sourceMappingURL=transaction.schema.d.ts.map