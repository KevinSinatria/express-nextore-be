import transactionSchema from "./transaction.schema.js";
import z from "zod";
import transactionService from "./transaction.service.js";
import sendResponse from "../../utils/sendResponse.js";
const transactionController = {
    getAllTransaction: async (req, res, next) => {
        try {
            const { query } = req;
            const result = await transactionService.getAllTransaction({ query });
            sendResponse(res, 200, "Transactions fetched successfully", result.data, result.meta);
        }
        catch (error) {
            next(error);
        }
    },
    getTransactionById: async (req, res, next) => {
        try {
            const result = await transactionService.getTransactionById({
                id: req.params.id,
            });
            sendResponse(res, 200, "Transaction fetched successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    createTransaction: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const result = await transactionService.createTransaction({
                data: req.body,
                userId,
            });
            sendResponse(res, 201, "Transaction created successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
    deleteTransaction: async (req, res, next) => {
        try {
            const result = await transactionService.deleteTransaction({
                id: req.params.id,
            });
            sendResponse(res, 200, "Transaction deleted successfully", result);
        }
        catch (error) {
            next(error);
        }
    },
};
export default transactionController;
//# sourceMappingURL=transaction.controller.js.map