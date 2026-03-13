import { z } from "zod";
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
type PaginationParams = z.infer<typeof paginationQuerySchema>;
/**
 * Menghitung parameter skip dan take (limit) untuk pagination Prisma.
 * @param query - Objek query dari request (page, limit)
 * @returns { page, limit, skip }
 */
export declare const getPaginationParams: (query: PaginationParams) => {
    page: number | undefined;
    limit: number | undefined;
    skip: number;
};
/**
 * Membuat objek metadata untuk response pagination.
 * @param totalItems - Jumlah total data
 * @param page - Halaman saat ini
 * @param limit - Batas data per halaman
 * @returns Metadata pagination
 */
export declare const createPaginationMeta: (totalItems: number, page?: number, limit?: number) => {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
export {};
//# sourceMappingURL=pagination.d.ts.map