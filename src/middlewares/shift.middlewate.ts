import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import { CustomError } from "../utils/custom-error.js";

export const shiftGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError(401, "Unauthorized");
    }

    const activeShift = await prisma.cashShift.findFirst({
      where: {
        userId: userId,
        status: "OPEN",
      },
    });

    if (!activeShift) {
      throw new CustomError(403, "Access denied. You must open a shift and deposit initial capital first.");
    }

    (req as any).shiftId = activeShift.id;

    next();
  } catch (error) {
    next(error);
  }
};