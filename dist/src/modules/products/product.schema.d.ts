import z from "zod";
declare const productSchema: {
    getAllProductsSchema: z.ZodObject<{
        query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            search: z.ZodOptional<z.ZodString>;
            categoryId: z.ZodOptional<z.ZodString>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    getProductByIdSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    createProductSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            sku: z.ZodString;
            hpp: z.z.ZodCoercedNumber<unknown>;
            price: z.z.ZodCoercedNumber<unknown>;
            stock: z.z.ZodCoercedNumber<unknown>;
            lowStockThreshold: z.z.ZodCoercedNumber<unknown>;
            categoryId: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    updateProductSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
        body: z.ZodObject<{
            name: z.ZodString;
            sku: z.ZodString;
            hpp: z.z.ZodCoercedNumber<unknown>;
            price: z.z.ZodCoercedNumber<unknown>;
            stock: z.z.ZodCoercedNumber<unknown>;
            lowStockThreshold: z.z.ZodCoercedNumber<unknown>;
            categoryId: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    deleteProductSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
};
export default productSchema;
//# sourceMappingURL=product.schema.d.ts.map