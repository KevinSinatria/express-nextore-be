import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import purchaseOrderSchema from "./purchase-order.schema.js";
import purchaseOrderController from "./purchase-order.controller.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

const purchaseOrderRoute = express.Router();

purchaseOrderRoute.use(isAuthenticated);

purchaseOrderRoute.post(
  "/",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.createPurchaseOrderSchema),
  purchaseOrderController.create,
);

purchaseOrderRoute.get(
  "/",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.getAllPurchaseOrdersSchema),
  purchaseOrderController.getAll,
);

purchaseOrderRoute.get(
  "/:id",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.getByIdPurchaseOrderSchema),
  purchaseOrderController.getById,
);

purchaseOrderRoute.get(
  "/request",
  authorizeRole(["ADMIN"]),
  purchaseOrderController.getPendingPurchaseOrders,
);

purchaseOrderRoute.put(
  "/:id",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.updatePurchaseOrderSchema),
  purchaseOrderController.update,
);

purchaseOrderRoute.patch(
  "/:id/approve",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.approvePurchaseOrderSchema),
  purchaseOrderController.approve,
);

purchaseOrderRoute.delete(
  "/:id",
  authorizeRole(["ADMIN"]),
  validate(purchaseOrderSchema.getByIdPurchaseOrderSchema),
  purchaseOrderController.delete,
);

export default purchaseOrderRoute;
