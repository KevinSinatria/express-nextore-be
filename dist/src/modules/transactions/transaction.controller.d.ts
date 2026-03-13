import type { Request, Response, NextFunction } from "express";
import transactionSchema from "./transaction.schema.js";
import z from "zod";
type GetAllTransactionRequest = Request<unknown, unknown, unknown, z.infer<typeof transactionSchema.getAllTransactionSchema>["query"]>;
type GetTransactionByIdRequest = Request<z.infer<typeof transactionSchema.getTransactionByIdSchema>["params"]>;
type CreateTransactionRequest = Request<unknown, unknown, z.infer<typeof transactionSchema.createTransactionSchema>["body"]>;
type DeleteTransactionRequest = Request<z.infer<typeof transactionSchema.deleteTransactionSchema>["params"]>;
declare const transactionController: {
    getAllTransaction: (req: GetAllTransactionRequest, res: Response, next: NextFunction) => Promise<void>;
    getTransactionById: (req: GetTransactionByIdRequest, res: Response, next: NextFunction) => Promise<void>;
    createTransaction: (req: CreateTransactionRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteTransaction: (req: DeleteTransactionRequest, res: Response, next: NextFunction) => Promise<void>;
};
export default transactionController;
//# sourceMappingURL=transaction.controller.d.ts.map