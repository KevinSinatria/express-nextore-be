import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import transactionSchema from "./transaction.schema.js";
import transactionController from "./transaction.controller.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

import { validateStock } from "../../middlewares/stock.middleware.js";

const transactionRoute = express.Router();

transactionRoute.use(isAuthenticated);

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
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.createTransactionSchema),
  validateStock,
  transactionController.createTransaction,
);

transactionRoute.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(transactionSchema.deleteTransactionSchema),
  transactionController.deleteTransaction,
);

transactionRoute.patch(
  "/:id/update-pending",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(transactionSchema.updatePendingTransactionSchema),
  // Tambah fungsi validator atau validateStock jika perlu
  transactionController.updatePendingTransaction,
);

export default transactionRoute;
