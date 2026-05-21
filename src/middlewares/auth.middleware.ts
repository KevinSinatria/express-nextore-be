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
      message: "Tidak diizinkan: Tidak ada sesi aktif yang ditemukan",
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
        message: "Tidak diizinkan: Pengguna belum terautentikasi",
      });
    }

    if (!allowedRoles.includes(session?.activeRole!)) {
      return res.status(403).json({
        success: false,
        message: `Dilarang: Akses ditolak untuk peran ${session?.activeRole}`,
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
      message: "Dilarang: Anda harus memilih mesin POS sebelum melakukan transaksi apa pun.",
    });
  }

  next();
}
