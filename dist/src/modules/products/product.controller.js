import productSchema from "./product.schema.js";
import z from "zod";
import productService from "./product.service.js";
import sendResponse from "../../utils/sendResponse.js";
const productController = {
    getAllProducts: async (req, res, next) => {
        try {
            const { query } = req;
            const result = await productService.getAllProducts({ query });
            sendResponse(res, 200, "Products fetched successfully", result.data, result.meta);
        }
        catch (error) {
            next(error);
        }
    },
    getProductById: async (req, res, next) => {
        try {
            const result = await productService.getProductById({
                id: req.params.id,
            });
            sendResponse(res, 200, "Product fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    createProduct: async (req, res, next) => {
        try {
            const result = await productService.createProduct({
                data: req.body,
                files: req.files,
            });
            sendResponse(res, 200, "Product created successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    updateProduct: async (req, res, next) => {
        try {
            const result = await productService.updateProduct({
                id: req.params.id,
                data: req.body,
                files: req.files,
            });
            sendResponse(res, 200, "Product updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    deleteProduct: async (req, res, next) => {
        try {
            const result = await productService.deleteProduct({
                id: req.params.id,
            });
            sendResponse(res, 200, "Product deleted successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    alertLowStock: async (req, res, next) => {
        try {
            const result = await productService.alertLowStock();
            sendResponse(res, 200, "Low stock products fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
};
export default productController;
//# sourceMappingURL=product.controller.js.map