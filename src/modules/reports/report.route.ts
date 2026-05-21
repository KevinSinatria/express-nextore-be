import express from "express";
import reportController from "./report.controller.js";
import { isAuthenticated, authorizeRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import reportSchema from "./report.schema.js";

const reportRoute = express.Router();

const allowedRoles = ["SUPERUSER", "ADMIN", "SUPERVISOR"];

reportRoute.get(
  "/sales/analytics",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(reportSchema.getSalesAnalyticsSchema),
  reportController.getSalesAnalytics
);

reportRoute.get(
  "/sales/audit",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(reportSchema.getSalesAuditTrailSchema),
  reportController.getSalesAuditTrail
);

reportRoute.get(
  "/inventory/expiry",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(reportSchema.getInventoryExpirySchema),
  reportController.getInventoryExpiry
);

export default reportRoute;
