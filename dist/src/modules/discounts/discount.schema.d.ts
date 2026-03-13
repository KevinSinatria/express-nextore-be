import z from "zod";
declare const discountSchema: {
    getAllDiscountSchema: z.ZodObject<{
        query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            search: z.ZodOptional<z.ZodString>;
            isActive: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodPipe<z.ZodString, z.ZodTransform<boolean, string>>]>>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    getDiscountByIdSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    createDiscountSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                readonly PERCENTAGE: "PERCENTAGE";
                readonly FIXED_AMOUNT: "FIXED_AMOUNT";
            }>>>;
            value: z.ZodNumber;
            startDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
            endDate: z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>;
            isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            isTransactionLevel: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    updateDiscountSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodEnum<{
                readonly PERCENTAGE: "PERCENTAGE";
                readonly FIXED_AMOUNT: "FIXED_AMOUNT";
            }>>;
            value: z.ZodOptional<z.ZodNumber>;
            startDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
            endDate: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<Date, string>>>;
            isActive: z.ZodOptional<z.ZodBoolean>;
            isTransactionLevel: z.ZodOptional<z.ZodBoolean>;
            productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    deleteDiscountSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
};
export default discountSchema;
//# sourceMappingURL=discount.schema.d.ts.map