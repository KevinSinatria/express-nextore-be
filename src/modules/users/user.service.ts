import z from "zod";
import userSchema from "./user.schema.js";
import prisma from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
  getPaginationParams,
  createPaginationMeta,
} from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";
import { auth } from "../../lib/auth.js";
import { hashPassword } from "better-auth/crypto";

type CreateUserParams = z.infer<typeof userSchema.createUserSchema>;

const userService = {
  getAllUsers: async ({ query }: { query: any }) => {
    const { page, limit, skip } = getPaginationParams({
      page: parseInt(query.page || "1"),
      limit: parseInt(query.limit || "10"),
    });

    const where: Prisma.UserWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { username: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit || 10,
        include: { accounts: { select: { providerId: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, meta: createPaginationMeta(count, page, limit) };
  },

  getUserById: async ({ id }: { id: string }) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { accounts: true, sessions: true },
    });
    if (!user) throw new CustomError(404, `User with ID ${id} not found`);
    return user;
  },

  getUserByUsername: async ({ username }: { username: string }) => {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { accounts: true, sessions: true },
    });
    if (!user)
      throw new CustomError(404, `User with username ${username} not found`);
    return user;
  },

  createUser: async ({ data }: { data: CreateUserParams["body"] }) => {
    const newUser = await auth.api.signUpEmail({
      body: {
        email: `${data.username}@nextore.com`,
        password: data.password,
        username: data.username,
        name: data.name,
      },
    });

    await prisma.user.update({
      where: {
        id: newUser.user.id,
      },
      data: {
        roles: data.roles,
        isSuspended: data.isSuspended,
      },
    });

    return await prisma.user.update({
      where: { id: newUser.user.id },
      data: { roles: data.roles },
    });
  },

  updateUser: async ({ id, data }: { id: string; data: any }) => {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (data.name) updateData.name = data.name;
      if (data.roles) updateData.roles = data.roles;
      if (data.password) {
        const hashedPassword = await hashPassword(data.password);

        await prisma.account.updateMany({
          where: {
            userId: id,
            providerId: "credential",
          },
          data: {
            password: hashedPassword,
          },
        });
      }

      if (data.username) {
        updateData.username = data.username;
        updateData.displayUsername = data.username;
      }

      if (data.isSuspended) {
        updateData.isSuspended = data.isSuspended;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return updatedUser;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new CustomError(404, `User with ID "${id}" not found`);
        }
      }
      throw err;
    }
  },

  deleteUser: async ({ id }: { id: string }) => {
    return await prisma.user.delete({ where: { id } });
  },
};

export default userService;
