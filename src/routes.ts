import express from "express";
import productRoute from "./modules/products/product.route.js";
import categoryRoute from "./modules/categories/category.route.js";
import transactionRoute from "./modules/transactions/transaction.route.js";
import discountRoute from "./modules/discounts/discount.route.js";
import memberRoute from "./modules/members/member.route.js";
import userRoute from "./modules/users/user.route.js";
import authRoute from "./modules/auth/auth.route.js";

const routes = express.Router();

routes.use("/products", productRoute);
routes.use("/categories", categoryRoute);
routes.use("/transactions", transactionRoute);
routes.use("/discounts", discountRoute);
routes.use("/members", memberRoute);
routes.use("/users", userRoute);
routes.use("/auth", authRoute);

export default routes;
