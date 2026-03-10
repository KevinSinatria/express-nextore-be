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

productRoute.use(isAuthenticated, authorizeRole(["ADMIN", "SUPERVISOR"]));

productRoute.get(
  "/",
  validate(productSchema.getAllProductsSchema),
  productController.getAllProducts,
);

productRoute.get("/alert-low-stock", productController.alertLowStock);

productRoute.get(
  "/:id",
  validate(productSchema.getProductByIdSchema),
  productController.getProductById,
);

productRoute.post(
  "/",
  uploadMiddleware.single("image"),
  validate(productSchema.createProductSchema),
  productController.createProduct,
);

productRoute.put(
  "/:id",
  uploadMiddleware.single("image"),
  validate(productSchema.updateProductSchema),
  productController.updateProduct,
);

productRoute.delete(
  "/:id",
  validate(productSchema.deleteProductSchema),
  productController.deleteProduct,
);

export default productRoute;
