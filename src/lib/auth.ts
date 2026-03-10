import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { customSession, openAPI, username } from "better-auth/plugins";
import prisma from "../config/prisma.js";
import { env } from "../config/env.js";

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
          role: true,
          username: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        userData,
        user,
        session,
      };
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: ["CASHIER", "ADMIN", "SUPERVISOR"],
        required: true,
        defaultValue: "CASHIER",
      },
    },
  },
});
