import type { Request, Response, NextFunction } from "express";
import cashShiftService from "./cashshift.service.js";
import sendResponse from "../../utils/sendResponse.js";
import prisma from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { ReportStatus } from "../../generated/prisma/enums.js";
import { CustomError } from "../../utils/custom-error.js";

const cashShiftController = {
  getAllshift: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const shift = await prisma.cashShift.findMany({
        where: status ? { status: status as any } : {},
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
        orderBy: {
          startTime: `desc`,
        },
      });
      const totalData = await prisma.cashShift.count({
        where: status ? { status: status as any } : {},
      });

      const totalPages = Math.ceil(totalData / limit);

      const formattedData = shift.map((shift) => ({
        shiftId: shift.id,
        cashierName: shift.user.name,
        StartingCash: shift.startingCash,
        ActualCash: shift.actualCash,
        difference: shift.difference,
        statusShift: shift.status,
        isIssues: shift.isIssues,
        reportStatus: shift.reportStatus,
        notes: shift.notes,
        additionalCash: shift.additionalCash,
        verifiedAt: shift.verifiedAt,
        verifiedBy: shift.verifiedBy,
      }));

      sendResponse(res, 200, "Semua data shift berhasil diambil", {
        data: formattedData,
        pagination: {
          totalData,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  openShift: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { startingCash } = req.body;

      const result = await cashShiftService.openShift(userId, startingCash);

      sendResponse(res, 201, "Shift berhasil dibuka", result);
    } catch (error) {
      next(error);
    }
  },

  getCurrentStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await cashShiftService.getCurrentShiftStatus(userId);
      sendResponse(res, 200, "Current shift status fetched", result);
    } catch (error) {
      next(error);
    }
  },

  approveShift: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shiftId = req.params.id as string;
      const { isIssues, additionalCash, notes, reportStatus } = req.body;
      const supervisorId = req.user!.id;

      const targetShift = await prisma.cashShift.findUnique({
        where: { id: shiftId },
      });

      if (!targetShift) {
        throw new CustomError(400, "Laporan shift tidak ditemukan");
      }

      if (targetShift.status === "OPEN") {
        throw new CustomError(
          400,
          "Tidak dapat memverifikasi laporan shift karena shift masih OPEN, kasir harus menutup shift terlebih dahulu",
        );
      }

      const updateReport = await prisma.cashShift.update({
        where: { id: shiftId },
        data: {
          isIssues: Boolean(isIssues),
          additionalCash: Number(additionalCash) || 0,
          notes,
          reportStatus:
            (reportStatus as ReportStatus) || ReportStatus.COMPLETED,
          verifiedBy: supervisorId,
          verifiedAt: new Date(),
        },
      });

      sendResponse(
        res,
        200,
        "Laporan kasir berhasil diverifikasi oleh supervisor",
        updateReport,
      );
    } catch (error) {
      next(error);
    }
  },

  deleteShift: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingShift = await prisma.cashShift.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      });

      if (!existingShift) {
        throw new CustomError(404, "Laporan shift tidak ditemukan");
      }

      if (existingShift.status === "OPEN") {
        throw new CustomError(
          400,
          "Tidak dapat menghapus laporan shift karena shift masih OPEN, kasir harus menutup shift terlebih dahulu",
        );
      }

      const deleteShift = await prisma.cashShift.delete({
        where: { id },
      });

      sendResponse(res, 200, "Laporan shift berhasil dihapus", deleteShift);
    } catch (error) {
      next(error);
    }
  },
};

export default cashShiftController;
