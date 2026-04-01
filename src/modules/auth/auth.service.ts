import prisma from "../../config/prisma.js";
import { CustomError } from "../../utils/custom-error.js";
import type { Role } from "../../generated/prisma/enums.js";
import type z from "zod";
import authSchema from "./auth.schema.js";
import { auth } from "../../lib/auth.js";

type LoginParams = z.infer<typeof authSchema.loginSchema>;

const authService = {
  selectRole: async ({
    role,
    sessionId,
    userId,
  }: {
    role: Role;
    sessionId: string;
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
        id: sessionId,
      },
      data: {
        activeRole: role,
      },
    });

    return;
  },

  login: async ({ username, password }: LoginParams["body"]) => {
    const session = await auth.api.signInUsername({
      body: { username, password },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      throw new CustomError(401, "Invalid username or password");
    }

    if (user.roles && user.roles.length > 0) {
      if (user.roles.length === 1) {
        await prisma.session.update({
          where: {
            token: session.token,
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
            token: session.token,
          },
        };
      } else if (user.roles.length > 1) {
        return {
          success: true,
          message: "Please select a role first.",
          data: {
            requiresRoleSelection: true,
            token: session.token,
            availableRoles: user.roles,
          },
        };
      }
    }

    throw new CustomError(403, "This account doesn't have any role.");
  },
};

export default authService;
