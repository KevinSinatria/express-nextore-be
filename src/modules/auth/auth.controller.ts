import type { Request, Response, NextFunction } from "express";
import type z from "zod";
import authSchema from "./auth.schema.js";
import authService from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";

type SelectRoleRequest = Request<
  unknown,
  unknown,
  z.infer<typeof authSchema.selectRoleSchema>["body"]
>;

const authController = {
  selectRole: async (
    req: SelectRoleRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const result = await authService.selectRole({
        role: req.body.role,
        token: req.session!.token,
        userId,
      });
      sendResponse(res, 200, "Role selected successfully", result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login({
        ...req.body,
        headers: req.headers,
      });

      if (result.data.headers) {
        result.data.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
      }

      sendResponse(res, 200, result!.message, {
        ...result?.data,
        headers: undefined,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
