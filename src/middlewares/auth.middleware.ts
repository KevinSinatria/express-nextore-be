import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import prisma from "../config/prisma.js";

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

  const freshSession = await prisma.session.findUnique({
    where: {id: session.session.id}
  });

  req.user = session.user;
  req.session = freshSession as any;

  next();
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    const session = req.session;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    if (!allowedRoles.includes(session?.activeRole!)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role ${session?.activeRole}`,
      });
    }

    next();
  };
};

export const requireActivePos = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session;
  
  if (!session?.activePosId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You must select a POS machine before performingany transactions.",
    });
  }

  next();
}
