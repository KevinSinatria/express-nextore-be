import express from "express";
import productRoute from "./modules/products/product.route.js";
import categoryRoute from "./modules/categories/category.route.js";

const routes = express.Router();

routes.use("/products", productRoute);
routes.use("/categories", categoryRoute);

export default routes;
