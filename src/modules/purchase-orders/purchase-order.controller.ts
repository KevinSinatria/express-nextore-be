import type { Request, Response, NextFunction } from "express";
import purchaseOrderSchema from "./purchase-order.schema.js";
import type z from "zod";
import purchaseOrderService from "./purchase-order.service.js";
import sendResponse from "../../utils/sendResponse.js";
import { CustomError } from "../../utils/custom-error.js";

type CreatePurchaseOrderRequest = Request<
  unknown,
  unknown,
  z.infer<typeof purchaseOrderSchema.createPurchaseOrderSchema>["body"]
>;
type UpdatePurchaseOrderRequest = Request<
  z.infer<typeof purchaseOrderSchema.updatePurchaseOrderSchema>["params"],
  unknown,
  z.infer<typeof purchaseOrderSchema.updatePurchaseOrderSchema>["body"]
>;
type GetByIdPurchaseOrderRequest = Request<
  z.infer<typeof purchaseOrderSchema.getByIdPurchaseOrderSchema>["params"]
>;
type GetAllPurchaseOrdersRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof purchaseOrderSchema.getAllPurchaseOrdersSchema>["query"]
>;
type ApprovePurchaseOrderRequest = Request<
  z.infer<typeof purchaseOrderSchema.approvePurchaseOrderSchema>["params"]
>;

const purchaseOrderController = {
  create: async (
    req: CreatePurchaseOrderRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user!;
      const data = await purchaseOrderService.create({
        data: req.body,
        userId: user.id,
      });
      sendResponse(res, 201, "Draf pesanan pembelian berhasil dibuat", data);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (
    req: GetAllPurchaseOrdersRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await purchaseOrderService.getAll({ query: req.query });
      sendResponse(
        res,
        200,
        "Pesanan pembelian berhasil diambil",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: GetByIdPurchaseOrderRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await purchaseOrderService.getById({ id: req.params.id });
      sendResponse(res, 200, "Pesanan pembelian berhasil diambil", data);
    } catch (error) {
      next(error);
    }
  },

  getPendingPurchaseOrders: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await purchaseOrderService.getPending();
      sendResponse(
        res,
        200,
        "Pesanan pembelian berstatus PENDING berhasil diambil",
        result,
      );
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: UpdatePurchaseOrderRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await purchaseOrderService.update({
        id: req.params.id,
        data: req.body,
      });
      sendResponse(res, 200, "Draf pesanan pembelian berhasil diperbarui", data);
    } catch (error) {
      next(error);
    }
  },

  delete: async (
    req: GetByIdPurchaseOrderRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await purchaseOrderService.delete({ id: req.params.id });
      sendResponse(res, 200, "Draf pesanan pembelian berhasil dihapus");
    } catch (error) {
      next(error);
    }
  },

  approve: async (
    req: ApprovePurchaseOrderRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user!;
      const data = await purchaseOrderService.approve({
        id: req.params.id,
        userId: user.id,
      });
      sendResponse(res, 200, "Pesanan pembelian berhasil disetujui", data);
    } catch (error) {
      next(error);
    }
  },
};

export default purchaseOrderController;
