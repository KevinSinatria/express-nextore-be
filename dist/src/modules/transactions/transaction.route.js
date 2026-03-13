import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import transactionSchema from "./transaction.schema.js";
import transactionController from "./transaction.controller.js";
import { authorizeRole, isAuthenticated, } from "../../middlewares/auth.middleware.js";
const transactionRoute = express.Router();
transactionRoute.use(isAuthenticated);
transactionRoute.get("/", authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]), validate(transactionSchema.getAllTransactionSchema), transactionController.getAllTransaction);
transactionRoute.get("/:id", authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]), validate(transactionSchema.getTransactionByIdSchema), transactionController.getTransactionById);
transactionRoute.post("/", authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]), validate(transactionSchema.createTransactionSchema), transactionController.createTransaction);
transactionRoute.delete("/:id", authorizeRole(["ADMIN", "SUPERVISOR"]), validate(transactionSchema.deleteTransactionSchema), transactionController.deleteTransaction);
export default transactionRoute;
//# sourceMappingURL=transaction.route.js.map