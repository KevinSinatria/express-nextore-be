import express from "express";
import bundleController from "./bundle.controller.js";
import bundleSchema from "./bundle.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  isAuthenticated,
  authorizeRole,
} from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";

const bundleRoute = express.Router();

bundleRoute.use(isAuthenticated);

bundleRoute.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(bundleSchema.getAllBundlesSchema),
  bundleController.getAllBundles,
);

bundleRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(bundleSchema.getBundleByIdSchema),
  bundleController.getBundleById,
);

bundleRoute.post(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  uploadMiddleware.array("images", 5),
  validate(bundleSchema.createBundleSchema),
  bundleController.createBundle,
);

bundleRoute.put(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  uploadMiddleware.array("images", 5),
  validate(bundleSchema.updateBundleSchema),
  bundleController.updateBundle,
);

bundleRoute.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(bundleSchema.deleteBundleSchema),
  bundleController.deleteBundle,
);

export default bundleRoute;
