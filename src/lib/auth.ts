import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { customSession, openAPI, username } from "better-auth/plugins";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";
import { createId } from "@paralleldrive/cuid2";
import type { Role } from "../generated/prisma/enums.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env("BETTER_AUTH_SECRET"),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    env("BETTER_AUTH_URL"),
    "http://localhost:5000",
    "http://localhost:5173",
  ],
  advanced: {
    database: {
      generateId: () => createId(),
    },
  },
  session: {
    expiresIn: 60 * 60,
    updateAge: 60 * 5,
  },
  plugins: [
    username(),
    openAPI(),
    customSession(async ({ user, session }) => {
      const userData = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          roles: true,
          username: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const sessionData = await prisma.session.findUnique({
        where: {
          id: session.id,
        },
        select: {
          activeRole: true,
        },
      });

      return {
        user: {
          ...user,
          roles: userData?.roles as Role[],
        },
        session: {
          ...session,
          activeRole: sessionData?.activeRole as Role,
        },
      };
    }),
  ],
  user: {
    additionalFields: {
      roles: {
        type: ["CASHIER", "ADMIN", "SUPERVISOR", "SUPERUSER"],
        required: false,
        defaultValue: [],
      },
    },
  },
});
