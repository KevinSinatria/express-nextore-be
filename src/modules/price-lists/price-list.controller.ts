import type { Request, Response, NextFunction } from "express";
import priceListService from "./price-list.service.js";
import sendResponse from "../../utils/sendResponse.js";
import z from "zod";
import priceListSchema from "./price-list.schema.js";

type CreatePriceListRequest = Request<
  unknown,
  unknown,
  z.infer<typeof priceListSchema.createPriceListSchema>["body"]
>;

type GetAlPriceListRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof priceListSchema.getAllPriceListsSchema>["query"]
>;

type FindByIdPriceListRequest = Request<
  z.infer<typeof priceListSchema.getByIdPriceListSchema>["params"]
>;

type UpdatePriceListRequest = Request<
  z.infer<typeof priceListSchema.updatePriceListSchema>["params"],
  unknown,
  z.infer<typeof priceListSchema.updatePriceListSchema>["body"]
>;

type DeletePriceListRequest = Request<
  z.infer<typeof priceListSchema.getByIdPriceListSchema>["params"]
>;

const priceListController = {
  create: async (
    req: CreatePriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = await priceListService.create(req.body);
      sendResponse(res, 201, "Daftar harga berhasil dibuat", data);
    } catch (error) {
      next(error);
    }
  },

  getAll: async (
    req: GetAlPriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { data, meta } = await priceListService.getAll({
        query: req.query,
      });
      sendResponse(res, 200, "Daftar harga berhasil diambil", data, meta);
    } catch (error) {
      next(error);
    }
  },

  getActive: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await priceListService.getActive();
      if (!data) {
        sendResponse(res, 404, "Daftar harga aktif tidak ditemukan", {
          isDefault: true,
        });
        return;
      }
      sendResponse(res, 200, "Daftar harga aktif berhasil diambil", data);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: FindByIdPriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const data = await priceListService.getById(id);
      if (!data) {
        sendResponse(res, 404, "Daftar harga tidak ditemukan");
        return;
      }
      sendResponse(res, 200, "Detail daftar harga berhasil diambil", data);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: UpdatePriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const data = await priceListService.update(id, req.body);
      sendResponse(res, 200, "Daftar harga berhasil diperbarui", data);
    } catch (error) {
      next(error);
    }
  },

  delete: async (
    req: DeletePriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      await priceListService.delete(id);
      sendResponse(res, 200, "Daftar harga berhasil dihapus");
    } catch (error) {
      next(error);
    }
  },

  activate: async (
    req: FindByIdPriceListRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const data = await priceListService.activate(id);
      sendResponse(
        res,
        200,
        "Daftar harga berhasil diaktifkan, menimpa harga default",
        data,
      );
    } catch (error) {
      next(error);
    }
  },

  deactivateAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await priceListService.deactivateAll();
      sendResponse(
        res,
        200,
        "All price lists deactivated. Resumed to base product prices.",
      );
    } catch (error) {
      next(error);
    }
  },
};

export default priceListController;
