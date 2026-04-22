import type { Request, Response, NextFunction } from "express";
import bundleSchema from "./bundle.schema.js";
import type z from "zod";
import bundleService from "./bundle.service.js";
import sendResponse from "../../utils/sendResponse.js";

type GetAllBundleRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof bundleSchema.getAllBundlesSchema>["query"]
>;
type GetBundleByIdRequest = Request<
  z.infer<typeof bundleSchema.getBundleByIdSchema>["params"]
>;
type CreateBundleRequest = Request<
  unknown,
  unknown,
  z.infer<typeof bundleSchema.createBundleSchema>["body"]
>;
type UpdateBundleRequest = Request<
  z.infer<typeof bundleSchema.updateBundleSchema>["params"],
  unknown,
  z.infer<typeof bundleSchema.updateBundleSchema>["body"]
>;
type DeleteBundleRequest = Request<
  z.infer<typeof bundleSchema.deleteBundleSchema>["params"]
>;

const bundleController = {
  getAllBundles: async (
    req: GetAllBundleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await bundleService.getAllBundles({ query });
      sendResponse(
        res,
        200,
        "Paket (Bundle) berhasil diambil",
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  },

  getBundleById: async (
    req: GetBundleByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await bundleService.getBundleById({ id: req.params.id });
      sendResponse(res, 200, "Paket (Bundle) berhasil diambil", result);
    } catch (error) {
      next(error);
    }
  },

  createBundle: async (
    req: CreateBundleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await bundleService.createBundle({
        data: req.body,
        files: req.files as Express.Multer.File[] | undefined,
      });

      sendResponse(res, 201, "Paket (Bundle) berhasil dibuat", result);
    } catch (error) {
      next(error);
    }
  },

  updateBundle: async (
    req: UpdateBundleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await bundleService.updateBundle({
        id: req.params.id,
        data: req.body,
        files: req.files as Express.Multer.File[] | undefined,
      });
      sendResponse(res, 200, "Paket (Bundle) berhasil diperbarui", result);
    } catch (error) {
      next(error);
    }
  },

  deleteBundle: async (
    req: DeleteBundleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await bundleService.deleteBundle({ id: req.params.id });
      sendResponse(res, 200, "Paket (Bundle) berhasil dihapus", result);
    } catch (error) {
      next(error);
    }
  },
};

export default bundleController;
