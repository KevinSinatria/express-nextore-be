import type z from "zod";
import type discountSchema from "./discount.schema.js";
type getAllDiscountParams = z.infer<typeof discountSchema.getAllDiscountSchema>;
type getDiscountByIdParams = z.infer<typeof discountSchema.getDiscountByIdSchema>;
type createDiscountParams = z.infer<typeof discountSchema.createDiscountSchema>;
type updateDiscountParams = z.infer<typeof discountSchema.updateDiscountSchema>;
type deleteDiscountParams = z.infer<typeof discountSchema.deleteDiscountSchema>;
declare const discountService: {
    getAllDiscount: ({ query, }: {
        query: getAllDiscountParams["query"];
    }) => Promise<{
        data: ({
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
            type: import("../../generated/prisma/enums.js").DiscountType;
            value: number;
            description: string | null;
            startDate: Date;
            endDate: Date;
            isActive: boolean;
            isTransactionLevel: boolean;
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
    getDiscountById: ({ id, }: {
        id: getDiscountByIdParams["params"]["id"];
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
        type: import("../../generated/prisma/enums.js").DiscountType;
        value: number;
        description: string | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isTransactionLevel: boolean;
    }) | null>;
    createDiscount: ({ data }: {
        data: createDiscountParams["body"];
    }) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("../../generated/prisma/enums.js").DiscountType;
        value: number;
        description: string | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isTransactionLevel: boolean;
    }>;
    updateDiscount: ({ id, data, }: {
        id: updateDiscountParams["params"]["id"];
        data: updateDiscountParams["body"];
    }) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("../../generated/prisma/enums.js").DiscountType;
        value: number;
        description: string | null;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        isTransactionLevel: boolean;
    }>;
    deleteDiscount: ({ id, }: {
        id: deleteDiscountParams["params"]["id"];
    }) => Promise<{
        message: string;
    }>;
};
export default discountService;
//# sourceMappingURL=discount.service.d.ts.map