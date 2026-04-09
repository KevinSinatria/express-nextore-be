import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import transactionSchema from "./transaction.schema.js";
import transactionController from "./transaction.controller.js";
import {
  authorizeRole,
  isAuthenticated,
  requireActivePos,
} from "../../middlewares/auth.middleware.js";

import { validateStock } from "../../middlewares/stock.middleware.js";

const transactionRoute = express.Router();

transactionRoute.use(isAuthenticated);
transactionRoute.use(requireActivePos);

transactionRoute.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.getAllTransactionSchema),
  transactionController.getAllTransaction,
);

transactionRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.getTransactionByIdSchema),
  transactionController.getTransactionById,
);

transactionRoute.post(
  "/",
  authorizeRole(["SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.createTransactionSchema),
  validateStock,
  transactionController.createTransaction,
);

transactionRoute.delete(
  "/:id",
  authorizeRole(["SUPERVISOR"]),
  validate(transactionSchema.deleteTransactionSchema),
  transactionController.deleteTransaction,
);

transactionRoute.patch(
  "/:id/update-pending",
  authorizeRole(["SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.updatePendingTransactionSchema),
  // Tambah fungsi validator atau validateStock jika perlu
  transactionController.updatePendingTransaction,
);

export default transactionRoute;
