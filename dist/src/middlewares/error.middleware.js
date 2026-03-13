import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ZodError } from "zod";
import { CustomError } from "../utils/custom-error.js";
import { MulterError } from "multer";
export const errorHandler = (err, req, res, next) => {
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
            errors: err.format(),
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
        const errTyped = err;
        const target = errTyped.meta?.driverAdapterError?.cause?.constraint
            ?.fields;
        let cleanName;
        console.log("target: ", target);
        if (Array.isArray(target)) {
            cleanName = target.join(", ");
        }
        else {
            const parts = target.split("_").slice(1, -1);
            cleanName = parts.join("_");
        }
        return res.status(409).json({
            success: false,
            message: `Conflict: ${cleanName} already exists.`,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
//# sourceMappingURL=error.middleware.js.map