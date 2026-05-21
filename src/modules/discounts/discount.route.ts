import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import discountSchema from "./discount.schema.js";
import discountController from "./discount.controller.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

const discountRoute = express.Router();

discountRoute.use(isAuthenticated);

discountRoute.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(discountSchema.getAllDiscountSchema),
  discountController.getAllDiscount,
);

discountRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(discountSchema.getDiscountByIdSchema),
  discountController.getDiscountById,
);

discountRoute.post(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(discountSchema.createDiscountSchema),
  discountController.createDiscount,
);

discountRoute.put(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(discountSchema.updateDiscountSchema),
  discountController.updateDiscount,
);

discountRoute.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(discountSchema.deleteDiscountSchema),
  discountController.deleteDiscount,
);

export default discountRoute;
