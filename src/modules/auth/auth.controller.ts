import type { Request, Response, NextFunction } from "express";
import type z from "zod";
import authSchema from "./auth.schema.js";
import authService from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";
import cashShiftService from "../cashshift/cashshift.service.js";
import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";

type SelectRoleRequest = Request<
  unknown,
  unknown,
  z.infer<typeof authSchema.selectRoleSchema>["body"]
>;

type SelectPosRequest = Request<
  unknown,
  unknown,
  z.infer<typeof authSchema.selectPosSchema>["body"]
>;

const authController = {
  selectRole: async (
    req: SelectRoleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const result = await authService.selectRole({
        role: req.body.role,
        token: req.session!.token,
        userId,
      });
      sendResponse(res, 200, "Peran berhasil dipilih", result);
    } catch (error) {
      next(error);
    }
  },

  selectPos: async (
    req: SelectPosRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const { posId, startingCash } = req.body as {posId: string, startingCash?: number};
      const token = req.session!.token;

      if (startingCash == undefined || startingCash === null) {
        throw new CustomError(400, "Kas awal wajib diisi");
      }

      const result = await authService.selectPos({
        posId,
        userId,
        token,
      });

      await cashShiftService.openShift(userId, startingCash || 0);

      const successMessage = `Terminal POS berhasil dipilih dengan kas awal Rp${startingCash.toLocaleString()}`;

      sendResponse(res, 200, successMessage, result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login({
        ...req.body,
        headers: req.headers,
      });

      if (result.data.headers) {
        result.data.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
      }

      sendResponse(res, 200, result!.message, {
        ...result?.data,
        headers: undefined,
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const {actualCash} = req.body;

      const shiftResult = await cashShiftService.closeShift(userId, Number(actualCash) || 0);

      let customMessage = "Berhasil logout";
      
      if(shiftResult) {
       const expectedCash = shiftResult.expectedCash ?? 0;
       const diff = shiftResult.difference ?? 0;
       const totalSales = expectedCash - shiftResult.startingCash;

        if (diff > 0) {
          customMessage = `Berhasil logout. Terdapat kelebihan uang Rp${diff.toLocaleString()} dari total penjualan Rp${totalSales.toLocaleString()}.`;
        } else if (diff < 0) {
          customMessage = `Berhasil logout. Terdapat kekurangan uang (selisih) Rp${Math.abs(diff).toLocaleString()} dari total penjualan Rp${totalSales.toLocaleString()}.`;
        } else {
          customMessage = `Berhasil logout. Uang fisik sesuai dengan total penjualan sebesar Rp${totalSales.toLocaleString()}.`;
        }
      }

      await authService.logout({
        headers: req.headers,
        userId: req.user!.id,
      });
      sendResponse(res, 200, customMessage, shiftResult);
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
