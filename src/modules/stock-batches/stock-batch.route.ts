import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import stockBatchSchema from "./stock-batch.schema.js";
import stockBatchController from "./stock-batch.controller.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

const stockBatchRoute = express.Router();

stockBatchRoute.use(isAuthenticated);

stockBatchRoute.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(stockBatchSchema.getAllStockBatchesSchema),
  stockBatchController.getAllStockBatches,
);

stockBatchRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(stockBatchSchema.getStockBatchByIdSchema),
  stockBatchController.getStockBatchById,
);

stockBatchRoute.post(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(stockBatchSchema.createStockBatchSchema),
  stockBatchController.createStockBatch,
);

stockBatchRoute.patch(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(stockBatchSchema.updateStockBatchSchema),
  stockBatchController.updateStockBatch,
);

stockBatchRoute.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(stockBatchSchema.deleteStockBatchSchema),
  stockBatchController.deleteStockBatch,
);

export default stockBatchRoute;
