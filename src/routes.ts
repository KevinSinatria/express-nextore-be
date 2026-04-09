import express from "express";
import productRoute from "./modules/products/product.route.js";
import categoryRoute from "./modules/categories/category.route.js";
import transactionRoute from "./modules/transactions/transaction.route.js";
import discountRoute from "./modules/discounts/discount.route.js";
import memberRoute from "./modules/members/member.route.js";
import userRoute from "./modules/users/user.route.js";
import authRoute from "./modules/auth/auth.route.js";
import posRoute from "./modules/pos/pos.route.js";
import bundleRoute from "./modules/bundles/bundle.route.js";
import stockBatchRoute from "./modules/stock-batches/stock-batch.route.js";
import reportRoute from "./modules/reports/report.route.js";

const routes = express.Router();

routes.use("/products", productRoute);
routes.use("/categories", categoryRoute);
routes.use("/transactions", transactionRoute);
routes.use("/discounts", discountRoute);
routes.use("/members", memberRoute);
routes.use("/users", userRoute);
routes.use("/auth", authRoute);
routes.use("/pos", posRoute);
routes.use("/bundles", bundleRoute);
routes.use("/stock-batches", stockBatchRoute);
routes.use("/reports", reportRoute);

export default routes;
