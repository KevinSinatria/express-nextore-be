import type z from "zod";
import type transactionSchema from "./transaction.schema.js";
type getAllTransactionParams = z.infer<typeof transactionSchema.getAllTransactionSchema>;
type getTransactionByIdParams = z.infer<typeof transactionSchema.getTransactionByIdSchema>;
type createTransactionParams = z.infer<typeof transactionSchema.createTransactionSchema>;
type deleteTransactionParams = z.infer<typeof transactionSchema.deleteTransactionSchema>;
declare const transactionService: {
    getAllTransaction: ({ query, }: {
        query: getAllTransactionParams["query"];
    }) => Promise<{
        data: ({
            _count: {
                items: number;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            invoiceNumber: string;
            totalGross: number;
            totalDiscount: number;
            totalNet: number;
            totalProfit: number;
            paymentMethod: string;
            status: import("../../generated/prisma/enums.js").TransactionStatus;
            memberId: string | null;
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
    getTransactionById: ({ id, }: {
        id: getTransactionByIdParams["params"]["id"];
    }) => Promise<({
        user: {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            name: string;
            image: string | null;
            username: string;
            displayUsername: string | null;
            role: import("../../generated/prisma/enums.js").Role;
        };
        items: ({
            product: {
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
            };
        } & {
            id: string;
            totalDiscount: number;
            qty: number;
            priceAtSale: number;
            hppAtSale: number;
            subtotal: number;
            productId: string;
            transactionId: string;
        })[];
        member: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            points: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        invoiceNumber: string;
        totalGross: number;
        totalDiscount: number;
        totalNet: number;
        totalProfit: number;
        paymentMethod: string;
        status: import("../../generated/prisma/enums.js").TransactionStatus;
        memberId: string | null;
    }) | null>;
    createTransaction: ({ data, userId, }: {
        data: createTransactionParams["body"];
        userId: string;
    }) => Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        invoiceNumber: string;
        totalGross: number;
        totalDiscount: number;
        totalNet: number;
        totalProfit: number;
        paymentMethod: string;
        status: import("../../generated/prisma/enums.js").TransactionStatus;
        memberId: string | null;
    }>;
    deleteTransaction: ({ id, }: {
        id: deleteTransactionParams["params"]["id"];
    }) => Promise<{
        message: string;
    }>;
};
export default transactionService;
//# sourceMappingURL=transaction.service.d.ts.map