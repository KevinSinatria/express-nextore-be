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
        "Transactions fetched successfully",
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
      sendResponse(res, 200, "Transaction fetched successfully", result);
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
      const result = await transactionService.createTransaction({
        data: req.body,
        userId,
      });

      sendResponse(res, 201, "Transaction created successfully", result);
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
      const result = await transactionService.deleteTransaction({
        id: req.params.id,
      });
      sendResponse(res, 200, "Transaction deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },
};

export default transactionController;
