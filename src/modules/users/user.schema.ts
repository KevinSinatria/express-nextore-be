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
      .min(1, "Nama minimal terdiri dari 1 karakter")
      .max(20, "Nama maksimal 20 karakter"),
    username: z
      .string()
      .min(1, "Username minimal 1 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(
        /^[a-zA-Z0-9_]{1,20}$/,
        "Username minimal 1 karakter dan hanya boleh berisi huruf, angka, dan garis bawah",
      ),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Password harus berisi huruf kecil, huruf besar, dan angka",
      ),
    roles: z.array(z.enum(Role)),
    isSuspended: z.boolean().optional().default(false),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Nama minimal terdiri dari 1 karakter")
      .max(20, "Nama maksimal 20 karakter")
      .optional(),
    username: z
      .string()
      .min(1, "Username minimal 1 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(
        /^[a-zA-Z0-9_]{1,20}$/,
        "Username minimal 1 karakter dan hanya boleh berisi huruf, angka, dan garis bawah",
      )
      .optional(),
    roles: z.array(z.enum(Role)).optional(),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "Password harus berisi huruf kecil, huruf besar, dan angka",
      )
      .optional(),
    isSuspended: z.boolean().optional(),
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
