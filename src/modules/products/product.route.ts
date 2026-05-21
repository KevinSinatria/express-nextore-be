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
  authorizeRole(["ADMIN"]),
  productController.alertLowStock,
);

productRoute.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(productSchema.getProductByIdSchema),
  productController.getProductById,
);

productRoute.get(
  "/:id/price-histories",
  authorizeRole(["ADMIN"]),
  validate(productSchema.getProductByIdSchema),
  productController.getProductPriceHistories,
);

productRoute.post(
  "/",
  authorizeRole(["ADMIN"]),
  uploadMiddleware.array("images", 5),
  validate(productSchema.createProductSchema),
  productController.createProduct,
);

productRoute.put(
  "/:id",
  authorizeRole(["ADMIN"]),
  uploadMiddleware.array("images", 5),
  validate(productSchema.updateProductSchema),
  productController.updateProduct,
);

productRoute.delete(
  "/:id",
  authorizeRole(["ADMIN"]),
  validate(productSchema.deleteProductSchema),
  productController.deleteProduct,
);

export default productRoute;
