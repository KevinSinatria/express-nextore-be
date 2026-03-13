import express from "express";
import productRoute from "./modules/products/product.route.js";
import categoryRoute from "./modules/categories/category.route.js";
import transactionRoute from "./modules/transactions/transaction.route.js";
import discountRoute from "./modules/discounts/discount.route.js";
const routes = express.Router();
routes.use("/products", productRoute);
routes.use("/categories", categoryRoute);
routes.use("/transactions", transactionRoute);
routes.use("/discounts", discountRoute);
export default routes;
//# sourceMappingURL=routes.js.map