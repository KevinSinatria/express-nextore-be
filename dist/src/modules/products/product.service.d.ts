import z from "zod";
import productSchema from "./product.schema.js";
type GetAllProductsParams = z.infer<typeof productSchema.getAllProductsSchema>;
type GetProductByIdParams = z.infer<typeof productSchema.getProductByIdSchema>;
type CreateProductParams = z.infer<typeof productSchema.createProductSchema>;
type UpdateProductParams = z.infer<typeof productSchema.updateProductSchema>;
type DeleteProductParams = z.infer<typeof productSchema.deleteProductSchema>;
declare const productService: {
    getAllProducts: ({ query, }: {
        query: GetAllProductsParams["query"];
    }) => Promise<{
        data: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            } | null;
        } & {
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
    getProductById: ({ id, }: {
        id: GetProductByIdParams["params"]["id"];
    }) => Promise<({
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
        } | null;
    } & {
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
    }) | null>;
    createProduct: ({ data, files, }: {
        data: CreateProductParams["body"];
        files: Express.Multer.File[] | undefined;
    }) => Promise<{
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
    }>;
    updateProduct: ({ id, data, files, }: {
        id: UpdateProductParams["params"]["id"];
        data: UpdateProductParams["body"];
        files: Express.Multer.File[] | undefined;
    }) => Promise<{
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
    }>;
    deleteProduct: ({ id, }: {
        id: DeleteProductParams["params"]["id"];
    }) => Promise<{
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
    }>;
    alertLowStock: () => Promise<{
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
    }[]>;
};
export default productService;
//# sourceMappingURL=product.service.d.ts.map