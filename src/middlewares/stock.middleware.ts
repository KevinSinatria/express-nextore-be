import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import sendResponse from "../utils/sendResponse.js";
import { CustomError } from "../utils/custom-error.js";

/**
 * Middleware to pre-validate stock for bundles and products before transaction.
 */
export const validateStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return next();
  }

  try {
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { bundleComponents: true },
      });

      if (!product) {
        throw new CustomError(404, `Product ${item.productId} not found.`);
      }

      if (product.isBundle) {
        for (const component of product.bundleComponents) {
          const compProduct = await prisma.product.findUnique({
            where: { id: component.componentId },
          });

          if (!compProduct) {
            throw new CustomError(
              404,
              `Component ${component.componentId} for bundle ${product.name} not found.`,
            );
          }

          const neededQty = item.qty * component.qty;
          if (compProduct.totalStock < neededQty) {
            throw new CustomError(
              400,
              `Insufficient stock for component ${compProduct.name}. Required: ${neededQty}, Available: ${compProduct.totalStock}`,
            );
          }
        }
      } else {
        if (product.totalStock < item.qty) {
          throw new CustomError(
            400,
            `Insufficient stock for product ${product.name}. Required: ${item.qty}, Available: ${product.totalStock}`,
          );
        }
      }
    }

    next();
  } catch (error: any) {
    if (error instanceof CustomError) {
      sendResponse(res, error.statusCode, error.message);
    } else {
      console.error("Stock validation error:", error);
      sendResponse(res, 500, "Internal Server Error during stock validation");
    }
  }
};
