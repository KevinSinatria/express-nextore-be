import express from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import categorySchema from "./category.schema.js";
import categoryController from "./category.controller.js";
import { authorizeRole, isAuthenticated, } from "../../middlewares/auth.middleware.js";
const categoryRoute = express.Router();
categoryRoute.use(isAuthenticated);
categoryRoute.get("/", authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]), validate(categorySchema.getAllCategoriesSchema), categoryController.getAllCategories);
categoryRoute.get("/:id", authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]), validate(categorySchema.getCategoryByIdSchema), categoryController.getCategoryById);
categoryRoute.post("/", authorizeRole(["ADMIN", "SUPERVISOR"]), validate(categorySchema.createCategorySchema), categoryController.createCategory);
categoryRoute.put("/:id", authorizeRole(["ADMIN", "SUPERVISOR"]), validate(categorySchema.updateCategorySchema), categoryController.updateCategory);
categoryRoute.delete("/:id", authorizeRole(["ADMIN", "SUPERVISOR"]), validate(categorySchema.deleteCategorySchema), categoryController.deleteCategory);
export default categoryRoute;
//# sourceMappingURL=category.route.js.map