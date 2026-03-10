import { z } from "zod";

// Skema untuk memvalidasi query pagination
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).default(10).optional(),
});

type PaginationParams = z.infer<typeof paginationQuerySchema>;

/**
 * Menghitung parameter skip dan take (limit) untuk pagination Prisma.
 * @param query - Objek query dari request (page, limit)
 * @returns { page, limit, skip }
 */
export const getPaginationParams = (query: PaginationParams) => {
  const { page, limit } = paginationQuerySchema.parse(query);

  const skip = (page! - 1) * limit!;
  return { page, limit, skip };
};

/**
 * Membuat objek metadata untuk response pagination.
 * @param totalItems - Jumlah total data
 * @param page - Halaman saat ini
 * @param limit - Batas data per halaman
 * @returns Metadata pagination
 */
export const createPaginationMeta = (
  totalItems: number,
  page: number = 1,
  limit: number = 10,
) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
