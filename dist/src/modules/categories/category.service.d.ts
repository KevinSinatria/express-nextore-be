import z from "zod";
import categorySchema from "./category.schema.js";
type GetAllCategoriesParams = z.infer<typeof categorySchema.getAllCategoriesSchema>;
type GetCategoryByIdParams = z.infer<typeof categorySchema.getCategoryByIdSchema>;
type CreateCategoryParams = z.infer<typeof categorySchema.createCategorySchema>;
type UpdateCategoryParams = z.infer<typeof categorySchema.updateCategorySchema>;
type DeleteCategoryParams = z.infer<typeof categorySchema.deleteCategorySchema>;
declare const categoryService: {
    getAllCategories: ({ query, }: {
        query: GetAllCategoriesParams["query"];
    }) => Promise<{
        data: ({
            _count: {
                products: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        })[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getCategoryById: ({ id, }: {
        id: GetCategoryByIdParams["params"]["id"];
    }) => Promise<({
        products: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sku: string;
            images: string[];
            hpp: number;
            price: number;
            stock: number;
            lowStockThreshold: number;
            categoryId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }) | null>;
    createCategory: ({ data }: {
        data: CreateCategoryParams["body"];
    }) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    updateCategory: ({ id, data, }: {
        id: UpdateCategoryParams["params"]["id"];
        data: UpdateCategoryParams["body"];
    }) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    deleteCategory: ({ id, }: {
        id: DeleteCategoryParams["params"]["id"];
    }) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
};
export default categoryService;
//# sourceMappingURL=category.service.d.ts.map