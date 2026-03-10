import type { Request, Response, NextFunction } from "express";
import productSchema from "./product.schema.js";
import z from "zod";
import productService from "./product.service.js";

type GetAllProductRequest = Request<
  unknown,
  unknown,
  unknown,
  z.infer<typeof productSchema.getAllProductsSchema>["query"]
>;
type GetProductByIdRequest = Request<
  z.infer<typeof productSchema.getProductByIdSchema>["params"]
>;
type CreateProductRequest = Request<
  unknown,
  unknown,
  z.infer<typeof productSchema.createProductSchema>["body"]
>;
type UpdateProductRequest = Request<
  z.infer<typeof productSchema.updateProductSchema>["params"],
  unknown,
  z.infer<typeof productSchema.updateProductSchema>["body"]
>;
type DeleteProductRequest = Request<
  z.infer<typeof productSchema.deleteProductSchema>["params"]
>;

const productController = {
  getAllProducts: async (
    req: GetAllProductRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { query } = req;
      const result = await productService.getAllProducts({ query });
      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },
  getProductById: async (
    req: GetProductByIdRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await productService.getProductById({
        id: req.params.id,
      });
      return res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  createProduct: async (
    req: CreateProductRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await productService.createProduct({
        data: req.body,
        file: req.file,
      });

      return res.status(200).json({
        success: true,
        message: "Product created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  updateProduct: async (
    req: UpdateProductRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await productService.updateProduct({
        id: req.params.id,
        data: req.body,
        file: req.file,
      });
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  deleteProduct: async (
    req: DeleteProductRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await productService.deleteProduct({
        id: req.params.id,
      });
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  alertLowStock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.alertLowStock();
      return res.status(200).json({
        success: true,
        message: "Low stock products fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
