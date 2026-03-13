import type { Request, Response, NextFunction } from "express";
import categorySchema from "./category.schema.js";
import z from "zod";
type GetAllCategoryRequest = Request<unknown, unknown, unknown, z.infer<typeof categorySchema.getAllCategoriesSchema>["query"]>;
type GetCategoryByIdRequest = Request<z.infer<typeof categorySchema.getCategoryByIdSchema>["params"]>;
type CreateCategoryRequest = Request<unknown, unknown, z.infer<typeof categorySchema.createCategorySchema>["body"]>;
type UpdateCategoryRequest = Request<z.infer<typeof categorySchema.updateCategorySchema>["params"], unknown, z.infer<typeof categorySchema.updateCategorySchema>["body"]>;
type DeleteCategoryRequest = Request<z.infer<typeof categorySchema.deleteCategorySchema>["params"]>;
declare const categoryController: {
    getAllCategories: (req: GetAllCategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    getCategoryById: (req: GetCategoryByIdRequest, res: Response, next: NextFunction) => Promise<void>;
    createCategory: (req: CreateCategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    updateCategory: (req: UpdateCategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteCategory: (req: DeleteCategoryRequest, res: Response, next: NextFunction) => Promise<void>;
};
export default categoryController;
//# sourceMappingURL=category.controller.d.ts.map