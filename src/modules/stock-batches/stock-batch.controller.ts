import type { Request, Response, NextFunction } from "express";
import z from "zod";
import stockBatchSchema from "./stock-batch.schema.js";
import stockBatchService from "./stock-batch.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllStockBatchesRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof stockBatchSchema.getAllStockBatchesSchema>["query"]
>;
type GetStockBatchByIdRequest = Request<
  z.infer<typeof stockBatchSchema.getStockBatchByIdSchema>["params"]
>;
type CreateStockBatchRequest = Request<
  unknown,
  unknown,
  z.infer<typeof stockBatchSchema.createStockBatchSchema>["body"]
>;
type UpdateStockBatchRequest = Request<
  z.infer<typeof stockBatchSchema.updateStockBatchSchema>["params"],
  unknown,
  z.infer<typeof stockBatchSchema.updateStockBatchSchema>["body"]
>;
type DeleteStockBatchRequest = Request<
  z.infer<typeof stockBatchSchema.deleteStockBatchSchema>["params"]
>;

const stockBatchController = {
  getAllStockBatches: async (
    req: GetAllStockBatchesRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await stockBatchService.getAllStockBatches({ query });
      sendResponse(
        res,
        200,
        "Stock batches fetched successfully",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },

  getStockBatchById: async (
    req: GetStockBatchByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await stockBatchService.getStockBatchById({
        id: req.params.id,
      });
      sendResponse(res, 200, "Stock batch fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },

  createStockBatch: async (
    req: CreateStockBatchRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await stockBatchService.createStockBatch({
        data: req.body,
      });
      sendResponse(res, 201, "Stock batch created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  updateStockBatch: async (
    req: UpdateStockBatchRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await stockBatchService.updateStockBatch({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(res, 200, "Stock batch updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  deleteStockBatch: async (
    req: DeleteStockBatchRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await stockBatchService.deleteStockBatch({
        id: req.params.id,
      });
      sendResponse(res, 200, "Stock batch deleted successfully", result);
    } catch (error) {
      next(error);
    }
  },
};

export default stockBatchController;
