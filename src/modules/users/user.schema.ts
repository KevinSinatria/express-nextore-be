import z from "zod";
import { Role } from "../../generated/prisma/enums.js";

const getAllUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const getUserByUsernameSchema = z.object({
  params: z.object({
    username: z.string(),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character")
      .max(20, "Name must be at most 20 characters"),
    username: z
      .string()
      .min(1, "Username must be at least 1 character")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]{1,20}$/,
        "Username must be at least 1 characters long and contain only letters, numbers, and underscores",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    roles: z.array(z.enum(Role)),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character")
      .max(20, "Name must be at most 20 characters")
      .optional(),
    username: z
      .string()
      .min(1, "Username must be at least 1 character")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]{1,20}$/,
        "Username must be at least 1 characters long and contain only letters, numbers, and underscores",
      )
      .optional(),
    roles: z.array(z.enum(Role)).optional(),
  }),
});

const deleteUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export default {
  getAllUsersSchema,
  getUserByIdSchema,
  getUserByUsernameSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
};
