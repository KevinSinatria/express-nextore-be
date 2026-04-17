import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { CustomError } from "../utils/custom-error.js";
import { MulterError } from "multer";
import { APIError } from "better-auth";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("ERROR: ", err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Zod Errors (validasi)
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((issue) => ({
        path: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
    });
  }

  if (err instanceof APIError && err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.body?.message,
    });
  }

  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      message: "File too large",
    });
  }

  // Handle Prisma not found errors
  if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  // Handle Prisma unique constraint errors
  if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
    interface errType {
      meta?: {
        driverAdapterError?: {
          cause?: {
            constraint?: {
              fields?: string | string[];
            };
          };
        };
      };
    }

    const errTyped = err as errType;
    const target = errTyped.meta?.driverAdapterError?.cause?.constraint
      ?.fields as string | string[];
    let cleanName: string;

    if (Array.isArray(target)) {
      cleanName = target.join(", ");
    } else {
      const parts = target.split("_").slice(1, -1);
      cleanName = parts.join("_");
    }

    return res.status(409).json({
      success: false,
      message: `Conflict: ${cleanName} already exists.`,
    });
  }

  // Handle Prisma foreign key constraint errors
  if (err instanceof PrismaClientKnownRequestError && err.code === "P2003") {
    return res.status(409).json({
      success: false,
      message:
        "Cannot delete or modify record because it is currently referenced by other records (Foreign Key Constraint Warning).",
    });
  }

  // Handle Prisma relation violation errors
  if (err instanceof PrismaClientKnownRequestError && err.code === "P2014") {
    return res.status(409).json({
      success: false,
      message:
        "The change you are trying to make would violate the required relation between models.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
