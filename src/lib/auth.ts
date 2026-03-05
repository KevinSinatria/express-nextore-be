import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { BETTER_AUTH_SECRET } from "../config/env";
import { customSession, username } from "better-auth/plugins";
import prisma from "../config/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: BETTER_AUTH_SECRET,
  plugins: [
    username(),
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
        type: "string",
        required: true,
        defaultValue: "KASIR",
      },
    },
  },
});
