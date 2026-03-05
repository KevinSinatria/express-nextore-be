import { ZodError, type ZodObject } from "zod";
import type { NextFunction, Request, Response } from "express";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error);
      }
      next(error);
    }
  };
