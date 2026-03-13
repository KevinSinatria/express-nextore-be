import type { Request, Response, NextFunction } from "express";
import discountSchema from "./discount.schema.js";
import z from "zod";
type GetAllDiscountRequest = Request;
type GetDiscountByIdRequest = Request<z.infer<typeof discountSchema.getDiscountByIdSchema>["params"]>;
type CreateDiscountRequest = Request<unknown, unknown, z.infer<typeof discountSchema.createDiscountSchema>["body"]>;
type UpdateDiscountRequest = Request<z.infer<typeof discountSchema.updateDiscountSchema>["params"], unknown, z.infer<typeof discountSchema.updateDiscountSchema>["body"]>;
type DeleteDiscountRequest = Request<z.infer<typeof discountSchema.deleteDiscountSchema>["params"]>;
declare const discountController: {
    getAllDiscount: (req: GetAllDiscountRequest, res: Response, next: NextFunction) => Promise<void>;
    getDiscountById: (req: GetDiscountByIdRequest, res: Response, next: NextFunction) => Promise<void>;
    createDiscount: (req: CreateDiscountRequest, res: Response, next: NextFunction) => Promise<void>;
    updateDiscount: (req: UpdateDiscountRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteDiscount: (req: DeleteDiscountRequest, res: Response, next: NextFunction) => Promise<void>;
};
export default discountController;
//# sourceMappingURL=discount.controller.d.ts.map