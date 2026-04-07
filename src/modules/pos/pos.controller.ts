import { type Request, type Response, type NextFunction, response } from "express";
import posService from "./pos.service.js";
import sendResponse from "../../utils/sendResponse.js";
import type z from "zod";
import type posSchema from "./pos.schema.js";

type CreatePosRequest = Request<unknown, unknown, z.infer<typeof posSchema.createPosSchema>["body"]>;
type UpdatePosRequest = Request<z.infer<typeof posSchema.updatePosSchema>["params"], unknown, z.infer<typeof posSchema.updatePosSchema>["body"]>;

const posController = {
  createPos: async (req: CreatePosRequest, res: Response, next: NextFunction) => {
    try {
      const result = await posService.createPos(req.body);
      sendResponse(res, 201, "POS terminal created successfully", result);
    } catch (error) {
      next(error);
    }
  },

  getAllPos: async (req: Request, res: Response, next: NextFunction) => {
    try  {
      const result = await posService.getAllPos();
      sendResponse(res, 200, "POS list retrieved successfully", result);
    }catch (error) {
      next(error);
    }
  },

  getPosById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await posService.getPosById(id);
      sendResponse(res, 200, "POS Terminal details retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  },

  updatePos: async (req: UpdatePosRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const result = await posService.updatePos(id, req.body);
      sendResponse(res, 200, "POS Terminal updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  deletePos: async (req: Request, res:Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await posService.deletePos(id);
      sendResponse(res, 200, "POS Terminal deleted successfully");
    } catch (error) {
      next(error);;
    }
  },
};

export default posController;

