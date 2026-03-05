import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No active session found",
    });
  }

  // Attach session and user to request object
  req.user = session.userData;
  req.session = session.session;

  next();
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role ${user.role}`,
      });
    }

    next();
  };
};
