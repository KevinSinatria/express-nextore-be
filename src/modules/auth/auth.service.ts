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
        "Forbidden: You don't have permission to access this role.",
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

    if(needsPos.includes(role)) {
     availablePos = await prisma.pos.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        isActive: true,
        activeUser: {
          select: {name: true}
        }
      }
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
      where: {id: posId},
    });

    if (!pos) {
      throw new CustomError(404, "POS Terminal not found.");
    }

    if (pos.isActive && pos.activeUserId !== userId) {
      throw new CustomError(400, "This terminal is already in use by another user.");
    }

    await prisma.pos.update({
      where: {id: posId},
      data: {
        isActive: true,
        activeUserId: userId,
      },
    });

    await prisma.session.update({
      where: {token: token},
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
      where: {
        id: session.response.user.id,
      },
    });

    if (!user) {
      throw new CustomError(401, "Invalid username or password");
    }

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
          message: "Login successfully.",
          data: {
            requiresRoleSelection: false,
            availablePos,
            headers: session.headers,
          },
        };
      } else if (user.roles.length > 1) {
        return {
          success: true,
          message: "Please select a role first.",
          data: {
            requiresRoleSelection: true,
            availableRoles: user.roles,
            availablePos,
            headers: session.headers,
          },
        };
      }
    }

    throw new CustomError(403, "This account doesn't have any role.");
  },

  logout: async ({headers, userId}: {headers: any; userId:string}) => {
    await prisma.pos.updateMany({
      where: {
        activeUserId: userId,
      },
      data: {
        isActive: false,
        activeUserId: null
      },
    });

    await auth.api.signOut({
      headers: fromNodeHeaders(headers)
    });
    return;
  },
};

export default authService;