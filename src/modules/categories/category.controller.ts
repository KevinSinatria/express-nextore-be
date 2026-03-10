import type { Request, Response, NextFunction } from "express";
import categorySchema from "./category.schema.js";
import z from "zod";
import categoryService from "./category.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllCategoryRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof categorySchema.getAllCategoriesSchema>["query"]
>;
type GetCategoryByIdRequest = Request<
  z.infer<typeof categorySchema.getCategoryByIdSchema>["params"]
>;
type CreateCategoryRequest = Request<
  unknown,
  unknown,
  z.infer<typeof categorySchema.createCategorySchema>["body"]
>;
type UpdateCategoryRequest = Request<
  z.infer<typeof categorySchema.updateCategorySchema>["params"],
  unknown,
  z.infer<typeof categorySchema.updateCategorySchema>["body"]
>;
type DeleteCategoryRequest = Request<
  z.infer<typeof categorySchema.deleteCategorySchema>["params"]
>;

const categoryController = {
  getAllCategories: async (
    req: GetAllCategoryRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await categoryService.getAllCategories({ query });
      sendResponse(
        res,
        200,
        "Categories fetched successfully",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },
  getCategoryById: async (
    req: GetCategoryByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await categoryService.getCategoryById({
        id: req.params.id,
      });
      sendResponse(res, 200, "Category fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },
  createCategory: async (
    req: CreateCategoryRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await categoryService.createCategory({
        data: req.body,
      });

      sendResponse(res, 201, "Category created successfully", result);
    } catch (error) {
      next(error);
    }
  },
  updateCategory: async (
    req: UpdateCategoryRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await categoryService.updateCategory({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(res, 200, "Category updated successfully", result);
    } catch (error) {
      next(error);
    }
  },
  deleteCategory: async (
    req: DeleteCategoryRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await categoryService.deleteCategory({
        id: req.params.id,
      });
      sendResponse(res, 200, "Category deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },
};

export default categoryController;
