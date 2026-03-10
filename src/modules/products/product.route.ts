import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import productSchema from "./product.schema.js";
import productController from "./product.controller.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../middlewares/upload.middleware.js";

const productRoute = express.Router();

productRoute.use(isAuthenticated);

productRoute.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(productSchema.getAllProductsSchema),
  productController.getAllProducts,
);

productRoute.get(
  "/alert-low-stock",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  productController.alertLowStock,
);

productRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(productSchema.getProductByIdSchema),
  productController.getProductById,
);

productRoute.post(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  uploadMiddleware.single("image"),
  validate(productSchema.createProductSchema),
  productController.createProduct,
);

productRoute.put(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  uploadMiddleware.single("image"),
  validate(productSchema.updateProductSchema),
  productController.updateProduct,
);

productRoute.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(productSchema.deleteProductSchema),
  productController.deleteProduct,
);

export default productRoute;
