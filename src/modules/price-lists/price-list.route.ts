import express from "express";
import priceListController from "./price-list.controller.js";
import {
  isAuthenticated,
  authorizeRole,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import priceListSchema from "./price-list.schema.js";

const priceListRoute = express.Router();

const allowedRoles = ["ADMIN"];

priceListRoute.post(
  "/",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.createPriceListSchema),
  priceListController.create,
);

priceListRoute.get(
  "/",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.getAllPriceListsSchema),
  priceListController.getAll,
);

priceListRoute.get(
  "/active",
  isAuthenticated,
  authorizeRole(allowedRoles),
  priceListController.getActive,
);

priceListRoute.get(
  "/:id",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.getByIdPriceListSchema),
  priceListController.getById,
);

priceListRoute.put(
  "/default",
  isAuthenticated,
  authorizeRole(allowedRoles),
  priceListController.deactivateAll,
);

priceListRoute.put(
  "/:id",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.updatePriceListSchema),
  priceListController.update,
);

priceListRoute.put(
  "/:id/activate",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.getByIdPriceListSchema),
  priceListController.activate,
);

priceListRoute.delete(
  "/:id",
  isAuthenticated,
  authorizeRole(allowedRoles),
  validate(priceListSchema.getByIdPriceListSchema),
  priceListController.delete,
);

export default priceListRoute;
