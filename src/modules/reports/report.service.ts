import prisma from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  createPaginationMeta,
  getPaginationParams,
} from "../../utils/pagination.js";
import type z from "zod";
import type reportSchema from "./report.schema.js";

type getSalesAnalyticsParams = z.infer<
  typeof reportSchema.getSalesAnalyticsSchema
>;
type getSalesAuditTrailParams = z.infer<
  typeof reportSchema.getSalesAuditTrailSchema
>;
type getInventoryExpiryParams = z.infer<
  typeof reportSchema.getInventoryExpirySchema
>;

const reportService = {
  getSalesAnalytics: async ({
    query,
  }: {
    query: getSalesAnalyticsParams["query"];
  }) => {
    const { startDate, endDate, userId, posId } = query;

    const where: Prisma.TransactionWhereInput = {
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (userId) where.userId = userId;
    if (posId) where.posId = posId;

    const [aggregate, transactionCount, itemsAggregate] = await Promise.all([
      prisma.transaction.aggregate({
        where,
        _sum: {
          totalNet: true,
          totalProfit: true,
          totalGross: true,
        },
      }),
      prisma.transaction.count({
        where,
      }),
      prisma.transactionItem.aggregate({
        where: {
          transaction: where,
        },
        _sum: {
          qty: true,
        },
      }),
    ]);

    return {
      totalOmzet: aggregate._sum.totalNet || 0,
      totalProfit: aggregate._sum.totalProfit || 0,
      totalGross: aggregate._sum.totalGross || 0,
      volumeTransactions: transactionCount,
      volumeItems: itemsAggregate._sum.qty || 0,
    };
  },

  getSalesAuditTrail: async ({
    query,
  }: {
    query: getSalesAuditTrailParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });

    const { startDate, endDate, userId, posId } = query;

    const where: Prisma.TransactionWhereInput = {
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (userId) where.userId = userId;
    if (posId) where.posId = posId;

    const isExport = ["csv", "excel", "pdf"].includes(query.format);
    const take = isExport ? undefined : limit;
    const offset = isExport ? undefined : skip;

    const [data, count] = await Promise.all([
      prisma.transaction.findMany({
        where,
        ...(offset !== undefined && { skip: offset }),
        ...(take !== undefined && { take }),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          pos: { select: { id: true, name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const mappedData = (data as any[]).map((tx, index) => {
      const obj: any = {};
      if (isExport) {
        obj.no = (offset !== undefined ? offset : 0) + index + 1;
      } else {
        obj.id = tx.id;
      }

      obj.invoiceNumber = tx.invoiceNumber;
      obj.timestamp = new Date(tx.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });

      if (!isExport) {
        obj.cashierId = tx.userId;
        obj.posTerminalId = tx.posId;
      }

      if (!userId || !isExport) obj.cashierName = tx.user?.name || "Unknown";
      if (!posId || !isExport) obj.posTerminalName = tx.pos?.name || "N/A";

      obj.totalGross = tx.totalGross;
      obj.totalNet = tx.totalNet;
      obj.totalProfit = tx.totalProfit;
      obj.totalHpp = tx.totalHpp;

      return obj;
    });

    if (isExport) {
      const subtitles: string[] = [];
      if (startDate || endDate)
        subtitles.push(
          `Periode: ${startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Awal"} - ${endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Akhir"}`,
        );
      if (userId && data.length > 0)
        subtitles.push(`Kasir: ${data[0]?.user?.name || "Unknown"}`);
      if (posId && data.length > 0)
        subtitles.push(`Terminal POS: ${data[0]?.pos?.name || "N/A"}`);
      return { data: mappedData, subtitles, meta: null };
    }

    const meta = createPaginationMeta(
      count,
      parseInt(query.page || "1"),
      limit,
    );
    return { data: mappedData, meta };
  },

  getInventoryExpiry: async ({
    query,
  }: {
    query: getInventoryExpiryParams["query"];
  }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });

    const setting = await prisma.setting.findUnique({
      where: { id: "global-setting" },
    });
    const daysThreshold = setting?.expiredReminderDays ?? 30;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const where: Prisma.StockBatchWhereInput = {
      remainingQuantity: { gt: 0 },
      expiryDate: {
        not: null,
        lte: thresholdDate,
      },
    };

    const isExport = ["csv", "excel", "pdf"].includes(query.format);
    const take = isExport ? undefined : limit;
    const offset = isExport ? undefined : skip;

    const [data, count] = await Promise.all([
      prisma.stockBatch.findMany({
        where,
        ...(offset !== undefined && { skip: offset }),
        ...(take !== undefined && { take }),
        orderBy: { expiryDate: "asc" },
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
      prisma.stockBatch.count({ where }),
    ]);

    const mappedData = (data as any[]).map((batch) => ({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productName: batch.product.name,
      sku: batch.product.sku,
      expiryDate: batch.expiryDate,
      remainingStock: batch.remainingQuantity,
    }));

    if (isExport) {
      return { data: mappedData, meta: null };
    }

    const meta = createPaginationMeta(
      count,
      parseInt(query.page || "1"),
      limit,
    );
    return { data: mappedData, meta };
  },
};

export default reportService;
