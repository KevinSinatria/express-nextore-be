import { type ZodObject } from "zod";
import type { NextFunction, Request, Response } from "express";
export declare const validate: (schema: ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.middleware.d.ts.map