import type { Request, Response, NextFunction } from "express";
import transactionSchema from "./transaction.schema.js";
import z from "zod";
import transactionService from "./transaction.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllTransactionRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof transactionSchema.getAllTransactionSchema>["query"]
>;

type GetTransactionByIdRequest = Request<
  z.infer<typeof transactionSchema.getTransactionByIdSchema>["params"]
>;

type CreateTransactionRequest = Request<
  unknown,
  unknown,
  z.infer<typeof transactionSchema.createTransactionSchema>["body"]
>;

type DeleteTransactionRequest = Request<
  z.infer<typeof transactionSchema.deleteTransactionSchema>["params"]
>;

type UpdatePendingTransactionRequest = Request<
  z.infer<typeof transactionSchema.updatePendingTransactionSchema>["params"],
  unknown,
  z.infer<typeof transactionSchema.updatePendingTransactionSchema>["body"]
>;

const transactionController = {
  getAllTransaction: async (
    req: GetAllTransactionRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await transactionService.getAllTransaction({ query });
      sendResponse(
        res,
        200,
        "Transaksi berhasil diambil",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },
  getTransactionById: async (
    req: GetTransactionByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await transactionService.getTransactionById({
        id: req.params.id,
      });
      sendResponse(res, 200, "Transaksi berhasil diambil", result);
    } catch (error) {
      next(error);
    }
  },
  createTransaction: async (
    req: CreateTransactionRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const session = req.session as any;
      const posId = session?.activePosId;
      const activeShiftId = session?.activeShiftId;

      if (!activeShiftId) {
        return sendResponse(res, 400, "Transaksi tidak dapat dibuat karena tidak ada shift aktif", null);
      }

      const result = await transactionService.createTransaction({
        data: req.body,
        userId,
        ...(activeShiftId && {cashShiftId: activeShiftId}),
        ...(posId && { posId }),
      });

      sendResponse(res, 201, "Transaksi berhasil dibuat", result);
    } catch (error) {
      next(error);
    }
  },
  deleteTransaction: async (
    req: DeleteTransactionRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userIdAsli = req.user!.id;
      const result = await transactionService.deleteTransaction({
        id: req.params.id,
        userIdAsli: userIdAsli,
      });
      sendResponse(res, 200, "Transaksi berhasil dibatalkan", result);
    } catch (error) {
      next(error);
    }
  },
  updatePendingTransaction: async (
    req: UpdatePendingTransactionRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userIdAsli = req.user!.id;
      const result = await transactionService.updatePendingTransaction({
        id: req.params.id,
        data: req.body,
        userIdAsli: userIdAsli,
      });
      sendResponse(
        res,
        200,
        "Transaksi yang tertunda berhasil diperbarui",
        result,
      );
    } catch (error) {
      next(error);
    }
  },
};

export default transactionController;
