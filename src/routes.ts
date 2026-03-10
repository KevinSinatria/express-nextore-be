import express from "express";
import productRoute from "./modules/products/product.route.js";

const routes = express.Router();

routes.use("/products", productRoute);

export default routes;
