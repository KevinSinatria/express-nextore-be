import type { Request, Response, NextFunction } from "express";
import productSchema from "./product.schema.js";
import z from "zod";
type GetAllProductRequest = Request<unknown, unknown, unknown, z.infer<typeof productSchema.getAllProductsSchema>["query"]>;
type GetProductByIdRequest = Request<z.infer<typeof productSchema.getProductByIdSchema>["params"]>;
type CreateProductRequest = Request<unknown, unknown, z.infer<typeof productSchema.createProductSchema>["body"]>;
type UpdateProductRequest = Request<z.infer<typeof productSchema.updateProductSchema>["params"], unknown, z.infer<typeof productSchema.updateProductSchema>["body"]>;
type DeleteProductRequest = Request<z.infer<typeof productSchema.deleteProductSchema>["params"]>;
declare const productController: {
    getAllProducts: (req: GetAllProductRequest, res: Response, next: NextFunction) => Promise<void>;
    getProductById: (req: GetProductByIdRequest, res: Response, next: NextFunction) => Promise<void>;
    createProduct: (req: CreateProductRequest, res: Response, next: NextFunction) => Promise<void>;
    updateProduct: (req: UpdateProductRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteProduct: (req: DeleteProductRequest, res: Response, next: NextFunction) => Promise<void>;
    alertLowStock: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default productController;
//# sourceMappingURL=product.controller.d.ts.map