import z from "zod";
declare const categorySchema: {
    getAllCategoriesSchema: z.ZodObject<{
        query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            search: z.ZodOptional<z.ZodString>;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    getCategoryByIdSchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    createCategorySchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    updateCategorySchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
        body: z.ZodObject<{
            name: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
    deleteCategorySchema: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.z.core.$strip>;
    }, z.z.core.$strip>;
};
export default categorySchema;
//# sourceMappingURL=category.schema.d.ts.map