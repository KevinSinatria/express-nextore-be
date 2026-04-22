import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
import type { Role } from "../../generated/prisma/enums.js";
import type z from "zod";
import authSchema from "./auth.schema.js";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { string } from "zod";

type LoginParams = z.infer<typeof authSchema.loginSchema>;

const authService = {
  selectRole: async ({
    role,
    token,
    userId,
  }: {
    role: Role;
    token: string;
    userId: string;
  }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: { roles: true },
    });

    if (!user?.roles.includes(role)) {
      throw new CustomError(
        403,
        "Dilarang: Anda tidak memiliki izin untuk mengakses peran ini.",
      );
    }

    await prisma.session.update({
      where: {
        token,
      },
      data: {
        activeRole: role,
      },
    });

    const needsPos = ["CASHIER", "SUPREVISOR"];
    let availablePos: any[] = [];

    if (needsPos.includes(role)) {
      availablePos = await prisma.pos.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          isActive: true,
          activeUser: {
            select: { name: true },
          },
        },
      });
    }

    return {
      selectedRole: role,
      availablePos,
    };
  },

  selectPos: async ({
    posId,
    userId,
    token,
  }: {
    posId: string;
    userId: string;
    token: string;
  }) => {
    const pos = await prisma.pos.findUnique({
      where: { id: posId },
    });

    if (!pos) {
      throw new CustomError(404, "Terminal POS tidak ditemukan.");
    }

    if (pos.isActive && pos.activeUserId !== userId) {
      throw new CustomError(
        400,
        "Terminal ini sedang digunakan oleh pengguna lain.",
      );
    }

    await prisma.pos.update({
      where: { id: posId },
      data: {
        isActive: true,
        activeUserId: userId,
      },
    });

    await prisma.session.update({
      where: { token: token },
      data: {
        activePosId: posId,
      },
    });

    return {
      posId: pos.id,
      name: pos.name,
      location: pos.location,
    };
  },

  login: async ({
    username,
    password,
    headers,
  }: LoginParams["body"] & { headers: any }) => {
    const session = await auth.api.signInUsername({
      body: { username, password },
      headers: fromNodeHeaders(headers),
      returnHeaders: true,
    });

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new CustomError(401, "Username atau password salah");
    }

    if (user.isSuspended) {
      throw new CustomError(
        403,
        "Akun telah disuspend/dinonaktifkan. Silakan hubungi administrator.",
      );
    }

    // const activeSession = await prisma.session.findFirst({
    //   where: {
    //     userId: user.id,
    //     expiresAt: {gt: new Date()}
    //   }
    // });

    // if (activeSession) {
    //   throw new CustomError(403, "Akun ini sudah masuk di perangkat lain. Silakan logout terlebih dahulu")
    // }

    // const session = await auth.api.signInUsername({
    //   body: {username, password},
    //   headers: fromNodeHeaders(headers),
    //   returnHeaders: true,
    // });

    const availablePos: any[] = [];

    if (user.roles && user.roles.length > 0) {
      if (user.roles.length === 1) {
        await prisma.session.update({
          where: {
            token: session.response.token,
          },
          data: {
            activeRole: user.roles[0]!,
          },
        });

        return {
          success: true,
          message: "Berhasil login.",
          data: {
            requiresRoleSelection: false,
            availablePos,
            headers: session.headers,
          },
        };
      } else if (user.roles.length > 1) {
        return {
          success: true,
          message: "Silakan pilih peran terlebih dahulu.",
          data: {
            requiresRoleSelection: true,
            availableRoles: user.roles,
            availablePos,
            headers: session.headers,
          },
        };
      }
    }

    throw new CustomError(403, "Akun ini tidak memiliki peran akses.");
  },

  logout: async ({ headers, userId }: { headers: any; userId: string }) => {
    await prisma.pos.updateMany({
      where: {
        activeUserId: userId,
      },
      data: {
        isActive: false,
        activeUserId: null,
      },
    });

    await auth.api.signOut({
      headers: fromNodeHeaders(headers),
    });
    return;
  },
};

export default authService;
