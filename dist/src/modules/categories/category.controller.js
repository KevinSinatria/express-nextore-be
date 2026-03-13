import categorySchema from "./category.schema.js";
import z from "zod";
import categoryService from "./category.service.js";
import sendResponse from "../../utils/sendResponse.js";
const categoryController = {
    getAllCategories: async (req, res, next) => {
        try {
            const { query } = req;
            const result = await categoryService.getAllCategories({ query });
            sendResponse(res, 200, "Categories fetched successfully", result.data, result.meta);
        }
        catch (error) {
            next(error);
        }
    },
    getCategoryById: async (req, res, next) => {
        try {
            const result = await categoryService.getCategoryById({
                id: req.params.id,
            });
            sendResponse(res, 200, "Category fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    createCategory: async (req, res, next) => {
        try {
            const result = await categoryService.createCategory({
                data: req.body,
            });
            sendResponse(res, 201, "Category created successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const result = await categoryService.updateCategory({
                id: req.params.id,
                data: req.body,
            });
            sendResponse(res, 200, "Category updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            const result = await categoryService.deleteCategory({
                id: req.params.id,
            });
            sendResponse(res, 200, "Category deleted successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
};
export default categoryController;
//# sourceMappingURL=category.controller.js.map