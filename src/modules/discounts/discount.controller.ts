import type { Request, Response, NextFunction } from "express";
import discountSchema from "./discount.schema.js";
import z from "zod";
import discountService from "./discount.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllDiscountRequest = Request;
type GetDiscountByIdRequest = Request<
  z.infer<typeof discountSchema.getDiscountByIdSchema>["params"]
>;
type CreateDiscountRequest = Request<
  unknown,
  unknown,
  z.infer<typeof discountSchema.createDiscountSchema>["body"]
>;
type UpdateDiscountRequest = Request<
  z.infer<typeof discountSchema.updateDiscountSchema>["params"],
  unknown,
  z.infer<typeof discountSchema.updateDiscountSchema>["body"]
>;
type DeleteDiscountRequest = Request<
  z.infer<typeof discountSchema.deleteDiscountSchema>["params"]
>;

const discountController = {
  getAllDiscount: async (
    req: GetAllDiscountRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = req.query as unknown as z.infer<
        typeof discountSchema.getAllDiscountSchema
      >["query"];
      const result = await discountService.getAllDiscount({ query });
      sendResponse(
        res,
        200,
        "Discounts fetched successfully",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },
  getDiscountById: async (
    req: GetDiscountByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await discountService.getDiscountById({
        id: req.params.id,
      });
      sendResponse(res, 200, "Discount fetched successfully", result);
    } catch (error) {
      next(error);
    }
  },
  createDiscount: async (
    req: CreateDiscountRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await discountService.createDiscount({
        data: req.body,
      });
      sendResponse(res, 201, "Discount created successfully", result);
    } catch (error) {
      next(error);
    }
  },
  updateDiscount: async (
    req: UpdateDiscountRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await discountService.updateDiscount({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(res, 200, "Discount updated successfully", result);
    } catch (error) {
      next(error);
    }
  },
  deleteDiscount: async (
    req: DeleteDiscountRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await discountService.deleteDiscount({
        id: req.params.id,
      });
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },
};

export default discountController;
