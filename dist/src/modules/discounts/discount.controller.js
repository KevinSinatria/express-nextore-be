import discountSchema from "./discount.schema.js";
import z from "zod";
import discountService from "./discount.service.js";
import sendResponse from "../../utils/sendResponse.js";
const discountController = {
    getAllDiscount: async (req, res, next) => {
        try {
            const query = req.query;
            const result = await discountService.getAllDiscount({ query });
            sendResponse(res, 200, "Discounts fetched successfully", result.data, result.meta);
        }
        catch (error) {
            next(error);
        }
    },
    getDiscountById: async (req, res, next) => {
        try {
            const result = await discountService.getDiscountById({
                id: req.params.id,
            });
            sendResponse(res, 200, "Discount fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    createDiscount: async (req, res, next) => {
        try {
            const result = await discountService.createDiscount({
                data: req.body,
            });
            sendResponse(res, 201, "Discount created successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    updateDiscount: async (req, res, next) => {
        try {
            const result = await discountService.updateDiscount({
                id: req.params.id,
                data: req.body,
            });
            sendResponse(res, 200, "Discount updated successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    deleteDiscount: async (req, res, next) => {
        try {
            const result = await discountService.deleteDiscount({
                id: req.params.id,
            });
            sendResponse(res, 200, result.message);
        }
        catch (error) {
            next(error);
        }
    },
};
export default discountController;
//# sourceMappingURL=discount.controller.js.map